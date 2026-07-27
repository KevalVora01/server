import { Invoice } from "../../domain/entities/Invoice";
import { IInvoiceRepository } from "../../domain/repositories/IInvoiceRepository";
import { IMaintenanceSettingRepository } from "../../domain/repositories/IMaintenanceSettingRepository";
import { GenerateInvoicesDto } from "../dtos/GenerateInvoicesDto";
import { MaintenanceSettingNotFoundError } from "../../domain/errors/MaintenanceErrors";
import { IApartmentRepository } from "../../../apartments/domain/repositories/IApartmentRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";

export class GenerateInvoicesUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly settingRepository: IMaintenanceSettingRepository,
    private readonly apartmentRepository: IApartmentRepository,
    private readonly residentRepository: IResidentRepository,
  ) {}

  async execute(dto: GenerateInvoicesDto): Promise<Invoice[]> {
    const setting = await this.settingRepository.get();

    if (!setting) {
      throw new MaintenanceSettingNotFoundError();
    }

    const apartments = await this.apartmentRepository.findAll({ pageNumber: 1, pageSize: 1000 });

    const invoicesOrNull = await Promise.all(
      apartments.items.map(async ({ apartment }) => {
        // The invoice belongs to whoever is the current occupant of the
        // apartment at generation time. That resident is the one liable to pay.
        // Apartments without a current occupant are skipped — there is no one
        // to bill and resident_id cannot be null.
        const occupant = await this.residentRepository.findOccupantByApartmentId(apartment.id!);
        if (!occupant?.id) return null;

        const invoice = Invoice.create({
          apartmentId: apartment.id!,
          residentId: occupant.id,
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
      })
    );

    const invoices = invoicesOrNull.filter((inv): inv is Invoice => inv !== null);

    const created = await Promise.all(invoices.map((invoice) => this.invoiceRepository.create(invoice)));

    return created;
  }
}