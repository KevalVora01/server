import { IInvoiceRepository } from "../../domain/repositories/IInvoiceRepository";
import { IMaintenanceNotifier } from "../../domain/services/IMaintenanceNotifier";
import {
  consolidateLateFees,
  recalculateTotal,
} from "../../domain/services/PenaltyCalculator";

export class SendMaintenanceRemindersJob {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly maintenanceNotifier: IMaintenanceNotifier,
  ) { }

  async execute(): Promise<{ penaltiesApplied: number; remindersSent: number }> {
    const today = new Date();

    const remindersSent = await this.sendDueSoonReminders(today)
      + await this.sendDueTodayReminders(today);
    const penaltiesApplied = await this.processNewlyOverdue(today)
      + await this.processOngoingOverdue(today);

    return { penaltiesApplied, remindersSent };
  }

  private async sendDueSoonReminders(today: Date): Promise<number> {
    const threeDaysFromNow = this.addDays(today, 3);
    const invoices = await this.invoiceRepository.findAllPendingWithDueDate(threeDaysFromNow);

    for (const invoice of invoices) {
      await this.maintenanceNotifier.notifyDueSoon(invoice);
    }
    return invoices.length;
  }

  private async sendDueTodayReminders(today: Date): Promise<number> {
    const invoices = await this.invoiceRepository.findAllPendingWithDueDate(today);

    for (const invoice of invoices) {
      await this.maintenanceNotifier.notifyDueToday(invoice);
    }
    return invoices.length;
  }

  // Apply 1st month 5% penalty to newly overdue invoices
  private async processNewlyOverdue(today: Date): Promise<number> {
    const invoices = await this.invoiceRepository.findAllNewlyOverdue(today);

    for (const invoice of invoices) {
      const updatedCharges = consolidateLateFees(invoice.extraCharges, invoice.baseAmount, 1);

      invoice.setExtraCharges(updatedCharges);
      invoice.setTotalAmount(recalculateTotal(invoice.baseAmount, updatedCharges));
      invoice.markOverdue();

      await this.invoiceRepository.update(invoice);
      await this.maintenanceNotifier.notifyOverdue(invoice);
    }
    return invoices.length;
  }

  // Update N-month late fee for ongoing overdue invoices and send weekly reminders
  private async processOngoingOverdue(today: Date): Promise<number> {
    const invoices = await this.invoiceRepository.findAllOverdueUnpaid();
    let count = 0;

    for (const invoice of invoices) {
      const daysSinceOverdue = this.daysBetween(invoice.dueDate, today);
      const totalMonthsOverdue = Math.floor(daysSinceOverdue / 30) + 1;

      // Extract applied late fee months
      let currentAppliedMonths = 0;
      const existingLateFee = invoice.extraCharges.find((c) =>
        c.label.toLowerCase().startsWith("late fee")
      );
      if (existingLateFee) {
        const match = existingLateFee.label.match(/(\d+)\s*Months?/i);
        currentAppliedMonths = match ? parseInt(match[1], 10) : 1;
      }

      if (totalMonthsOverdue > currentAppliedMonths) {
        const updatedCharges = consolidateLateFees(invoice.extraCharges, invoice.baseAmount, totalMonthsOverdue);

        invoice.setExtraCharges(updatedCharges);
        invoice.setTotalAmount(recalculateTotal(invoice.baseAmount, updatedCharges));

        await this.invoiceRepository.update(invoice);
        count++;
      }

      if (daysSinceOverdue > 0 && daysSinceOverdue % 7 === 0) {
        await this.maintenanceNotifier.notifyOverdueReminder(invoice);
      }
    }
    return count;
  }

  private daysBetween(from: Date, to: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((to.getTime() - from.getTime()) / msPerDay);
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}