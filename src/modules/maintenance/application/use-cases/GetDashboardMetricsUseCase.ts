import { IInvoiceRepository } from "../../domain/repositories/IInvoiceRepository";

export interface AdminDashboardMetrics {
  totalCollected: number;
  totalPending: number;
  overdueCount: number;
}

export interface ResidentDashboardMetrics {
  pendingDues: number;
  nextDueDate: Date | null;
}

export class GetDashboardMetricsUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) { }

  async executeForAdmin(): Promise<AdminDashboardMetrics> {
    return this.invoiceRepository.getAdminMetrics();
  }

  async executeForResident(residentId: number): Promise<ResidentDashboardMetrics> {
    return this.invoiceRepository.getResidentMetrics(residentId);
  }
}