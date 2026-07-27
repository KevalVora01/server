import { FamilyMember } from "../../domain/entities/FamilyMember";
import { IFamilyMemberRepository } from "../../domain/repositories/IFamilyMemberRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import {
  ResidentNotFoundError,
  UnauthorizedFamilyMemberAccessError,
} from "../../../residents/domain/errors/ResidentErrors";

export class ListApartmentFamilyMembersUseCase {
  constructor(
    private readonly familyMemberRepository: IFamilyMemberRepository,
    private readonly residentRepository: IResidentRepository,
  ) {}

  async execute(requestingResidentId: number): Promise<FamilyMember[]> {
    const requestingResident = await this.residentRepository.findById(requestingResidentId);

    if (!requestingResident) {
      throw new ResidentNotFoundError();
    }

    if (!requestingResident.isOwner) {
      throw new UnauthorizedFamilyMemberAccessError();
    }

    return this.familyMemberRepository.findByApartmentId(requestingResident.apartmentId);
  }
}