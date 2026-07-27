import { IFamilyMemberRepository } from "../../domain/repositories/IFamilyMemberRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { FamilyMember } from "../../domain/entities/FamilyMember";
import { ResidentNotFoundError } from "../../../residents/domain/errors/ResidentErrors";

export class GetFamilyMembersUseCase {
  constructor(
    private readonly familyMemberRepository: IFamilyMemberRepository,
    private readonly residentRepository: IResidentRepository,
  ) {}

  async execute(residentId: number): Promise<FamilyMember[]> {
    // 1. Check resident exists
    const resident = await this.residentRepository.findById(residentId);
    if (!resident) {
      throw new ResidentNotFoundError();
    }

    // 2. Get family members
    return await this.familyMemberRepository.findByResidentId(residentId);
  }
}