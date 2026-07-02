import { IFamilyMemberRepository } from "../../domain/repositories/IFamilyMemberRepository";
import { FamilyMember, FamilyRelation } from "../../domain/entities/FamilyMember";
import { FamilyMemberModel } from "../models/FamilyMemberModel";

export class FamilyMemberRepository implements IFamilyMemberRepository {

  private toEntity(model: FamilyMemberModel): FamilyMember {
    return new FamilyMember({
      id: model.id,
      residentId: model.residentId,
      name: model.name,
      relation: model.relation as FamilyRelation,
      age: model.age,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  async create(familyMember: FamilyMember): Promise<FamilyMember> {
    const created = await FamilyMemberModel.create({
      residentId: familyMember.residentId,
      name: familyMember.name,
      relation: familyMember.relation,
      age: familyMember.age ?? null,
    });

    return this.toEntity(created);
  }

  async findById(id: number): Promise<FamilyMember | null> {
    const model = await FamilyMemberModel.findByPk(id);
    if (!model) return null;
    return this.toEntity(model);
  }

  async findByResidentId(residentId: number): Promise<FamilyMember[]> {
    const models = await FamilyMemberModel.findAll({
      where: { residentId },
      order: [["createdAt", "ASC"]],
    });

    return models.map((model) => this.toEntity(model));
  }

  async update(familyMember: FamilyMember): Promise<FamilyMember> {
    await FamilyMemberModel.update(
      {
        name: familyMember.name,
        relation: familyMember.relation,
        age: familyMember.age ?? null,
      },
      { where: { id: familyMember.id } }
    );

    const updated = await FamilyMemberModel.findByPk(familyMember.id);
    return this.toEntity(updated!);
  }

  async delete(id: number): Promise<void> {
    await FamilyMemberModel.destroy({ where: { id } });
  }
}