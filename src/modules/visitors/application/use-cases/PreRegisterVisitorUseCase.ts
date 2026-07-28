import { Visitor } from "../../domain/entities/Visitor";
import { IVisitorRepository } from "../../domain/repositories/IVisitorRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { PreRegisterVisitorDto } from "../dtos/PreRegisterVisitorDto";
import { ResidentNotOccupantError } from "../../domain/errors/VisitorErrors";

export class PreRegisterVisitorUseCase {
  constructor(
    private readonly visitorRepository: IVisitorRepository,
    private readonly residentRepository: IResidentRepository,
  ) {}

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
    });

    return this.visitorRepository.create(visitor);
  }
} 