import { Op } from "sequelize";
import { IInvoiceRepository, ListInvoicesFilters } from "../../domain/repositories/IInvoiceRepository";
import { Invoice, InvoiceStatus, ExtraCharge } from "../../domain/entities/Invoice";
import { InvoiceModel } from "../models/InvoiceModel";
import { AdminDashboardMetrics, ResidentDashboardMetrics } from "../../application/use-cases/GetDashboardMetricsUseCase";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
import { ApartmentModel } from "../../../apartments/infrastructure/models/ApartmentModel";
import { buildPaginatedResult, PaginatedRequest, PaginatedResult } from "../../../../shared/types/Pagination";

export class InvoiceRepository implements IInvoiceRepository {

  private toEntity(model: InvoiceModel): Invoice {
    return new Invoice({
      id: model.id,
      apartmentId: model.apartmentId,
      residentId: model.residentId,
      month: model.month,
      year: model.year,
      baseAmount: Number(model.baseAmount),
      extraCharges: model.extraCharges as ExtraCharge[],
      totalAmount: Number(model.totalAmount),
      status: model.status as InvoiceStatus,
      dueDate: new Date(model.dueDate),
      paidAt: model.paidAt,
      paymentRef: model.paymentRef,
      pdfUrl: model.pdfUrl,
      createdAt: model.createdAt,
      apartment: model.apartment ? {
        id: model.apartment.id,
        block: model.apartment.block,
        floorNumber: model.apartment.floorNumber,
        unitNumber: model.apartment.unitNumber,
      } : null,
      resident: model.resident ? {
        id: model.resident.id,
        userId: model.resident.userId,
        apartmentId: model.resident.apartmentId,
      } : null,
    });
  }

  async create(invoice: Invoice): Promise<Invoice> {
    const created = await InvoiceModel.create({
      apartmentId: invoice.apartmentId,
      residentId: invoice.residentId,
      month: invoice.month,
      year: invoice.year,
      baseAmount: invoice.baseAmount,
      extraCharges: invoice.extraCharges,
      totalAmount: invoice.totalAmount,
      status: invoice.status,
      dueDate: invoice.dueDate,
    });

    return this.toEntity(created);
  }

  async findById(id: number): Promise<Invoice | null> {
    const model = await InvoiceModel.findOne({
      where: { id },
      include: [
        { model: ResidentModel, as: "resident", attributes: ["id", "userId", "apartmentId"] },
        { model: ApartmentModel, as: "apartment", attributes: ["id", "block", "floorNumber", "unitNumber"] },
      ],
    });

    if (!model) return null;

    return this.toEntity(model);
  }

  async findAll(filters: ListInvoicesFilters): Promise<PaginatedResult<Invoice>> {
    const where: Record<string, unknown> = {};

    if (filters.status) where.status = filters.status;
    if (filters.month) where.month = filters.month;
    if (filters.year) where.year = filters.year;
    if (filters.residentId) where.residentId = filters.residentId;

    const offset = (filters.pageNumber - 1) * filters.pageSize;

    const { count, rows } = await InvoiceModel.findAndCountAll({
      where,
      include: [
        { model: ResidentModel, as: "resident", attributes: ["id", "userId", "apartmentId"] },
        { model: ApartmentModel, as: "apartment", attributes: ["id", "block", "floorNumber", "unitNumber"] },
      ],
      limit: filters.pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return buildPaginatedResult(
      rows.map((row) => this.toEntity(row)),
      count,
      filters.pageNumber,
      filters.pageSize
    );
  }

  async findByResidentId(residentId: number, pagination: PaginatedRequest): Promise<PaginatedResult<Invoice>> {
    const offset = (pagination.pageNumber - 1) * pagination.pageSize;

    const { count, rows } = await InvoiceModel.findAndCountAll({
      where: { residentId },
      limit: pagination.pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return buildPaginatedResult(
      rows.map((row) => this.toEntity(row)),
      count,
      pagination.pageNumber,
      pagination.pageSize
    );
  }

  async findAllPendingWithDueDate(dueDate: Date): Promise<Invoice[]> {
    const models = await InvoiceModel.findAll({
      where: {
        status: InvoiceStatus.PENDING,
        dueDate: this.toDateOnlyString(dueDate),
      },
    });

    return models.map((m) => this.toEntity(m));
  }

  async findAllNewlyOverdue(today: Date): Promise<Invoice[]> {
    const models = await InvoiceModel.findAll({
      where: {
        status: InvoiceStatus.PENDING,
        dueDate: { [Op.lt]: this.toDateOnlyString(today) },
      },
    });

    return models.map((m) => this.toEntity(m));
  }

  async findAllOverdueUnpaid(): Promise<Invoice[]> {
    const models = await InvoiceModel.findAll({
      where: { status: InvoiceStatus.OVERDUE },
    });

    return models.map((m) => this.toEntity(m));
  }

  async update(invoice: Invoice): Promise<Invoice> {
    await InvoiceModel.update(
      {
        extraCharges: invoice.extraCharges,
        totalAmount: invoice.totalAmount,
        status: invoice.status,
        paidAt: invoice.paidAt,
        paymentRef: invoice.paymentRef,
        pdfUrl: invoice.pdfUrl,
      },
      { where: { id: invoice.id } }
    );

    const updated = await InvoiceModel.findByPk(invoice.id);
    return this.toEntity(updated!);
  }

  async getAdminMetrics(): Promise<AdminDashboardMetrics> {
    const [totalCollectedResult, totalPendingResult, overdueCount] = await Promise.all([
      InvoiceModel.sum("totalAmount", { where: { status: InvoiceStatus.PAID } }),
      InvoiceModel.sum("totalAmount", { where: { status: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE] } }),
      InvoiceModel.count({ where: { status: InvoiceStatus.OVERDUE } }),
    ]);

    return {
      totalCollected: totalCollectedResult || 0,
      totalPending: totalPendingResult || 0,
      overdueCount,
    };
  }

  async getResidentMetrics(residentId: number): Promise<ResidentDashboardMetrics> {
    const pendingInvoices = await InvoiceModel.findAll({
      where: { residentId, status: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE] },
      order: [["dueDate", "ASC"]],
    });

    const pendingDues = pendingInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const nextDueDate = pendingInvoices.length > 0 ? pendingInvoices[0].dueDate : null;

    return { pendingDues, nextDueDate };
  }

  private toDateOnlyString(date: Date): string {
    return date.toISOString().split("T")[0];
  }
}