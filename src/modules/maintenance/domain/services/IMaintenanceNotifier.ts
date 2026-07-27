import { Invoice } from "../entities/Invoice";

export interface IMaintenanceNotifier {
  notifyDueSoon(invoice: Invoice): Promise<void>;
  notifyDueToday(invoice: Invoice): Promise<void>;
  notifyOverdue(invoice: Invoice): Promise<void>;
  notifyOverdueReminder(invoice: Invoice): Promise<void>;
  notifyPaymentSucceeded(invoice: Invoice): Promise<void>;
}