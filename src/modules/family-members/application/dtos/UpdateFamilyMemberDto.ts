import { FamilyRelation } from "../../domain/entities/FamilyMember";

export interface UpdateFamilyMemberDto {
  name?: string;
  relation?: FamilyRelation;
  age?: number | null;
}