import { TenantRequest } from "../../domain/entities/TenantRequest";
import { ITenantRequestRepository } from "../../domain/repositories/ITenantRequestRepository";
import { SubmitTenantRequestDto } from "../dtos/SubmitTenantRequestDto";
import { ApartmentAlreadyHasActiveTenantError } from "../../domain/errors/TenantRequestErrors";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";

export class SubmitTenantRequestUseCase {
  constructor(
    private readonly tenantRequestRepository: ITenantRequestRepository,
    private readonly residentRepository: IResidentRepository,
  ) {}

  async execute(dto: SubmitTenantRequestDto): Promise<TenantRequest> {
    // Block if there's already an active tenant occupying this apartment
    const existingOccupant = await this.residentRepository.findOccupantByApartmentId(dto.apartmentId);
    if (existingOccupant && !existingOccupant.isOwner) {
      throw new ApartmentAlreadyHasActiveTenantError();
    }

    // Block if there's already a pending request for this apartment
    const existingPending = await this.tenantRequestRepository.findPendingByApartmentId(dto.apartmentId);
    if (existingPending) {
      throw new ApartmentAlreadyHasActiveTenantError();
    }

    const request = TenantRequest.create({
      apartmentId: dto.apartmentId,
      requestedBy: dto.requestedBy,
      tenantName: dto.tenantName,
      tenantEmail: dto.tenantEmail,
      tenantPhone: dto.tenantPhone,
      moveInDate: dto.moveInDate,
    });

    return this.tenantRequestRepository.create(request);
  }
}