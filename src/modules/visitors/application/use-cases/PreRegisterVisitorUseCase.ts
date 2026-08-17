import { Visitor } from "../../domain/entities/Visitor";
import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { IVisitorNotifier } from "../../domain/services/IVisitorNotifier";
import { PreRegisterVisitorDto } from "../dtos/PreRegisterVisitorDto";
import { ResidentNotOccupantError } from "../../domain/errors/VisitorErrors";

export class PreRegisterVisitorUseCase {
  constructor(
    private readonly visitorRepository: IVisitorRepository,
    private readonly residentRepository: IResidentRepository,
    private readonly visitorNotifier: IVisitorNotifier,
  ) { }

  async execute(dto: PreRegisterVisitorDto): Promise<Visitor> {
    const resident = await this.residentRepository.findById(dto.residentId);

    if (!resident || !resident.isOccupant) {
      throw new ResidentNotOccupantError();
    }

    const visitor = Visitor.createPreRegistered({
      apartmentId: dto.apartmentId,
      residentId: dto.residentId,
      name: dto.name,
      phone: dto.phone,
      purpose: dto.purpose,
      expectedAt: dto.expectedAt,
      vehicleNumber: dto.vehicleNumber,
      photoUrl: dto.photoUrl,
    });

    const saved = await this.visitorRepository.create(visitor);
    await this.visitorNotifier.notifyVisitorUpdated(saved, "Approved", "pre_registered");

    return saved;
  }
} 