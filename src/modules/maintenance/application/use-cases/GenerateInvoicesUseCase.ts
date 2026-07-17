import { Invoice } from "../../domain/entities/Invoice";
import { IInvoiceRepository } from "../../domain/repositories/IInvoiceRepository";
import { IMaintenanceSettingRepository } from "../../domain/repositories/IMaintenanceSettingRepository";
import { GenerateInvoicesDto } from "../dtos/GenerateInvoicesDto";
import { MaintenanceSettingNotFoundError } from "../../domain/errors/MaintenanceErrors";
import { IApartmentRepository } from "../../../apartments/domain/repositories/IApartmentRepository";

export class GenerateInvoicesUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly settingRepository: IMaintenanceSettingRepository,
    private readonly apartmentRepository: IApartmentRepository,
  ) {}

  async execute(dto: GenerateInvoicesDto): Promise<Invoice[]> {
    const setting = await this.settingRepository.get();

    if (!setting) {
      throw new MaintenanceSettingNotFoundError();
    }

    const apartments = await this.apartmentRepository.findAll({ pageNumber: 1, pageSize: 1000 });

    const invoices = apartments.items.map(({ apartment }) => {
      const invoice = Invoice.create({
        apartmentId: apartment.id!,
        residentId: null,
        month: dto.month,
        year: dto.year,
        baseAmount: setting.amount,
        dueDate: dto.dueDate,
      });

      if (dto.extraCharges && dto.extraCharges.length > 0) {
        invoice.setExtraCharges(dto.extraCharges);
        const extraTotal = dto.extraCharges.reduce((sum, c) => sum + Number(c.amount), 0);
        invoice.setTotalAmount(setting.amount + extraTotal);
      }

      return invoice;
    });

    const created = await Promise.all(invoices.map((invoice) => this.invoiceRepository.create(invoice)));

    return created;
  }
}