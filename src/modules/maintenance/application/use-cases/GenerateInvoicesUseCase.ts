import { Invoice } from "../../domain/entities/Invoice";
import { IInvoiceRepository } from "../../domain/repositories/IInvoiceRepository";
import { IMaintenanceSettingRepository } from "../../domain/repositories/IMaintenanceSettingRepository";
import { GenerateInvoicesDto } from "../dtos/GenerateInvoicesDto";
import { MaintenanceSettingNotFoundError } from "../../domain/errors/MaintenanceErrors";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";

export class GenerateInvoicesUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly settingRepository: IMaintenanceSettingRepository,
    private readonly residentRepository: IResidentRepository,
  ) {}

  async execute(dto: GenerateInvoicesDto): Promise<Invoice[]> {
    const setting = await this.settingRepository.get();

    if (!setting) {
      throw new MaintenanceSettingNotFoundError();
    }

    const residents = await this.residentRepository.findAllActive();

    const invoices = residents.map((resident) => {
      const invoice = Invoice.create({
        apartmentId: resident.apartmentId,
        residentId: resident.id!,
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