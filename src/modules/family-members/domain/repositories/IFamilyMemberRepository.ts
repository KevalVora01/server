import { FamilyMember } from "../entities/FamilyMember";

export interface IFamilyMemberRepository {
  create(familyMember: FamilyMember): Promise<FamilyMember>;
  findById(id: number): Promise<FamilyMember | null>;
  findByResidentId(residentId: number): Promise<FamilyMember[]>;
  update(familyMember: FamilyMember): Promise<FamilyMember>;
  delete(id: number): Promise<void>;
}