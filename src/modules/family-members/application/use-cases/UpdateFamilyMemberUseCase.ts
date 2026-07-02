import { IFamilyMemberRepository } from "../../domain/repositories/IFamilyMemberRepository";
import { UpdateFamilyMemberDto } from "../dtos/UpdateFamilyMemberDto";
import { FamilyMember } from "../../domain/entities/FamilyMember";
import { FamilyMemberNotFoundError, FamilyMemberNotBelongsToResidentError } from "../../domain/errors/FamilyMemberErrors";

export class UpdateFamilyMemberUseCase {
  constructor(
    private readonly familyMemberRepository: IFamilyMemberRepository,
  ) { }

  async execute(id: number, residentId: number, dto: UpdateFamilyMemberDto): Promise<FamilyMember> {
    // 1. Check family member exists
    const familyMember = await this.familyMemberRepository.findById(id);
    if (!familyMember) {
      throw new FamilyMemberNotFoundError();
    }

    // 2. Check family member belongs to resident
    if (familyMember.residentId !== residentId) {
      throw new FamilyMemberNotBelongsToResidentError();
    }

    // 3. Update fields
    if (dto.name !== undefined) familyMember.updateName(dto.name);
    if (dto.relation !== undefined) familyMember.updateRelation(dto.relation);
    if (dto.age !== undefined) familyMember.updateAge(dto.age);

    // 4. Save to DB
    return await this.familyMemberRepository.update(familyMember);
  }
}