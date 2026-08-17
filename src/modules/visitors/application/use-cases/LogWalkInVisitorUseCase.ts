import { Visitor } from "../../domain/entities/Visitor";
import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { IVisitorNotifier } from "../../domain/services/IVisitorNotifier";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { LogWalkInVisitorDto } from "../dtos/LogWalkInVisitorDto";
import { ResidentNotOccupantError } from "../../domain/errors/VisitorErrors";

export class LogWalkInVisitorUseCase {
  constructor(
    private readonly visitorRepository: IVisitorRepository,
    private readonly visitorNotifier: IVisitorNotifier,
    private readonly residentRepository: IResidentRepository,
  ) {}

  async execute(dto: LogWalkInVisitorDto): Promise<Visitor> {
    const occupant = await this.residentRepository.findOccupantByApartmentId(dto.apartmentId);

    if (!occupant) {
      throw new ResidentNotOccupantError();
    }

    const visitor = Visitor.createWalkIn({
      apartmentId: dto.apartmentId,
      residentId: occupant.id!,
      name: dto.name,
      phone: dto.phone,
      purpose: dto.purpose,
      photoUrl: dto.photoUrl ?? null,
      vehicleNumber: dto.vehicleNumber ?? null,
      loggedBySecurityId: dto.loggedBySecurityId,
    });

    const saved = await this.visitorRepository.create(visitor);

    await this.visitorNotifier.notifyApprovalNeeded(saved);
    await this.visitorNotifier.notifyVisitorUpdated(saved, "Pending", "walk_in");

    return saved;
  }
}