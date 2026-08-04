import { Op, Transaction } from "sequelize";
import { ITenantRequestVoteRepository } from "../../domain/repositories/ITenantRequestVoteRepository";
import { TenantRequestVote, VoteChoice } from "../../domain/entities/TenantRequestVote";
import { TenantRequestVoteModel } from "../models/TenantRequestVoteModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
import { sequelize } from "../../../../shared/config/sequelize";

export class TenantRequestVoteRepository implements ITenantRequestVoteRepository {

  private toEntity(model: TenantRequestVoteModel): TenantRequestVote {
    const vote = new TenantRequestVote({
      id: model.id,
      tenantRequestId: model.tenantRequestId,
      committeeMemberId: model.committeeMemberId ?? undefined,
      vote: model.vote,
      recordedByAdminId: model.recordedByAdminId ?? undefined,
      createdAt: model.createdAt,
    });

    const relModel = model as TenantRequestVoteModel & { committeeMember?: Record<string, unknown> | null };
    vote.committeeMember = relModel.committeeMember ?? null;
    return vote;
  }

  async create(vote: TenantRequestVote): Promise<TenantRequestVote> {
    const created = await TenantRequestVoteModel.create({
      tenantRequestId: vote.tenantRequestId,
      committeeMemberId: vote.committeeMemberId ?? null,
      vote: vote.vote,
      recordedByAdminId: vote.recordedByAdminId ?? null,
    });

    return this.toEntity(created);
  }

  async update(vote: TenantRequestVote): Promise<TenantRequestVote> {
    const model = await TenantRequestVoteModel.findByPk(vote.id!);
    if (!model) throw new Error("Vote not found");
    model.vote = vote.vote;
    model.recordedByAdminId = vote.recordedByAdminId ?? null;
    await model.save();
    return this.toEntity(model);
  }

  async replaceAllForRequest(
    tenantRequestId: number,
    votes: TenantRequestVote[],
    recordedByAdminId?: number
  ): Promise<TenantRequestVote[]> {
    const result = await sequelize.transaction(async (transaction: Transaction) => {
      await TenantRequestVoteModel.destroy({
        where: { tenantRequestId },
        transaction,
      });

      if (votes.length === 0) {
        return [];
      }

      const created = await TenantRequestVoteModel.bulkCreate(
        votes.map((vote) => ({
          tenantRequestId: vote.tenantRequestId,
          committeeMemberId: vote.committeeMemberId ?? null,
          vote: vote.vote,
          recordedByAdminId: vote.recordedByAdminId ?? recordedByAdminId ?? null,
        })),
        { transaction }
      );

      return created.map((model) => this.toEntity(model));
    });

    return result;
  }

  async findByRequestId(tenantRequestId: number): Promise<TenantRequestVote[]> {
    const rows = await TenantRequestVoteModel.findAll({
      where: { tenantRequestId },
      include: [
        {
          model: ResidentModel,
          as: "committeeMember",
          attributes: ["id", "userId"],
          include: [{ model: UserModel, as: "user", attributes: ["id", "name"] }],
        },
      ],
    });

    return rows.map((row) => this.toEntity(row));
  }

  async findByRequestAndMember(tenantRequestId: number, committeeMemberId: number): Promise<TenantRequestVote | null> {
    const model = await TenantRequestVoteModel.findOne({
      where: { tenantRequestId, committeeMemberId },
    });

    if (!model) return null;
    return this.toEntity(model);
  }

  async findByRequestAndAdmin(tenantRequestId: number, adminId: number): Promise<TenantRequestVote | null> {
    const model = await TenantRequestVoteModel.findOne({
      where: { tenantRequestId, recordedByAdminId: adminId, committeeMemberId: null },
    });

    if (!model) return null;
    return this.toEntity(model);
  }

  async countByRequestId(tenantRequestId: number): Promise<{ approve: number; reject: number; total: number }> {
    const [approve, reject] = await Promise.all([
      TenantRequestVoteModel.count({ where: { tenantRequestId, vote: VoteChoice.APPROVE, committeeMemberId: { [Op.ne]: null } } }),
      TenantRequestVoteModel.count({ where: { tenantRequestId, vote: VoteChoice.REJECT, committeeMemberId: { [Op.ne]: null } } }),
    ]);

    return { approve, reject, total: approve + reject };
  }

  async countAdminVotes(tenantRequestId: number): Promise<{ approve: number; reject: number; total: number }> {
    const [approve, reject] = await Promise.all([
      TenantRequestVoteModel.count({ where: { tenantRequestId, vote: VoteChoice.APPROVE, recordedByAdminId: { [Op.ne]: null }, committeeMemberId: null } }),
      TenantRequestVoteModel.count({ where: { tenantRequestId, vote: VoteChoice.REJECT, recordedByAdminId: { [Op.ne]: null }, committeeMemberId: null } }),
    ]);

    return { approve, reject, total: approve + reject };
  }
}