import { IFamilyMemberRepository } from "../../domain/repositories/IFamilyMemberRepository";
import { FamilyMemberNotFoundError, FamilyMemberNotBelongsToResidentError } from "../../domain/errors/FamilyMemberErrors";

export class DeleteFamilyMemberUseCase {
  constructor(
    private readonly familyMemberRepository: IFamilyMemberRepository,
  ) {}

  async execute(id: number, residentId: number): Promise<void> {
    // 1. Check family member exists
    const familyMember = await this.familyMemberRepository.findById(id);
    if (!familyMember) {
      throw new FamilyMemberNotFoundError();
    }

    // 2. Check family member belongs to resident
    if (familyMember.residentId !== residentId) {
      throw new FamilyMemberNotBelongsToResidentError();
    }

    // 3. Delete
    await this.familyMemberRepository.delete(id);
  }
}