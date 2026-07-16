import { ITenantRequestVoteRepository } from "../../domain/repositories/ITenantRequestVoteRepository";
import { TenantRequestVote, VoteChoice } from "../../domain/entities/TenantRequestVote";
import { TenantRequestVoteModel } from "../models/TenantRequestVoteModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";

export class TenantRequestVoteRepository implements ITenantRequestVoteRepository {

  private toEntity(model: TenantRequestVoteModel): TenantRequestVote {
    const vote = new TenantRequestVote({
      id: model.id,
      tenantRequestId: model.tenantRequestId,
      committeeMemberId: model.committeeMemberId,
      vote: model.vote,
      recordedByAdminId: model.recordedByAdminId,
      createdAt: model.createdAt,
    });

    (vote as any).committeeMember = (model as any).committeeMember ?? null;
    return vote;
  }

  async create(vote: TenantRequestVote): Promise<TenantRequestVote> {
    const created = await TenantRequestVoteModel.create({
      tenantRequestId: vote.tenantRequestId,
      committeeMemberId: vote.committeeMemberId,
      vote: vote.vote,
      recordedByAdminId: vote.recordedByAdminId,
    });

    return this.toEntity(created);
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

  async countByRequestId(tenantRequestId: number): Promise<{ approve: number; reject: number; total: number }> {
    const [approve, reject] = await Promise.all([
      TenantRequestVoteModel.count({ where: { tenantRequestId, vote: VoteChoice.APPROVE } }),
      TenantRequestVoteModel.count({ where: { tenantRequestId, vote: VoteChoice.REJECT } }),
    ]);

    return { approve, reject, total: approve + reject };
  }
}