import { IFamilyMemberRepository } from "../../domain/repositories/IFamilyMemberRepository";
import { IResidentRepository } from "../../../residents/domain/repositories/IResidentRepository";
import { CreateFamilyMemberDto } from "../dtos/CreateFamilyMemberDto";
import { FamilyMember } from "../../domain/entities/FamilyMember";
import { ResidentNotFoundError } from "../../../residents/domain/errors/ResidentErrors";

export class CreateFamilyMemberUseCase {
  constructor(
    private readonly familyMemberRepository: IFamilyMemberRepository,
    private readonly residentRepository: IResidentRepository,
  ) {}

  async execute(dto: CreateFamilyMemberDto): Promise<FamilyMember> {
    // 1. Check resident exists
    const resident = await this.residentRepository.findById(dto.residentId);
    if (!resident) {
      throw new ResidentNotFoundError();
    }

    // 2. Create family member entity
    const familyMember = FamilyMember.create({
      residentId: dto.residentId,
      name: dto.name,
      relation: dto.relation,
      age: dto.age ?? null,
    });

    // 3. Save to DB
    return await this.familyMemberRepository.create(familyMember);
  }
}