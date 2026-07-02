import { FamilyRelation } from "../../domain/entities/FamilyMember";

export interface CreateFamilyMemberDto {
  residentId: number;
  name: string;
  relation: FamilyRelation;
  age?: number | null;
}