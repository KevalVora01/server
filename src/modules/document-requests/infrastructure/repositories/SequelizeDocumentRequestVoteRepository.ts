import { Op } from "sequelize";
import { IDocumentRequestVoteRepository } from "../../domain/repositories/IDocumentRequestVoteRepository";
import { DocumentRequestVote, VoteChoice } from "../../domain/entities/DocumentRequestVote";
import { DocumentRequestVoteModel } from "../models/DocumentRequestVoteModel";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";

export class SequelizeDocumentRequestVoteRepository
  implements IDocumentRequestVoteRepository
{
  async bulkCreate(votes: DocumentRequestVote[]): Promise<DocumentRequestVote[]> {
    const rows = await DocumentRequestVoteModel.bulkCreate(
      votes.map((v) => ({
        documentRequestId: v.documentRequestId,
        committeeMemberId: v.committeeMemberId ?? null,
        vote: v.vote,
        recordedByAdminId: v.recordedByAdminId ?? null,
      })),
      { updateOnDuplicate: ["vote", "recordedByAdminId"] },
    );

    return rows.map(
      (r) =>
        new DocumentRequestVote({
          id: r.id,
          documentRequestId: r.documentRequestId,
          committeeMemberId: r.committeeMemberId ?? undefined,
          vote: r.vote as VoteChoice,
          recordedByAdminId: r.recordedByAdminId ?? undefined,
          createdAt: r.createdAt,
        }),
    );
  }

  async findByDocumentRequestId(
    documentRequestId: number,
  ): Promise<DocumentRequestVote[]> {
    const rows = await DocumentRequestVoteModel.findAll({
      where: { documentRequestId },
      include: [
        {
          model: ResidentModel,
          as: "committeeMember",
          attributes: ["id", "apartmentId"],
          include: [
            { model: UserModel, as: "user", attributes: ["id", "name"], required: false },
          ],
        },
      ],
    });

    return rows.map((r) => {
      const row = r as unknown as Record<string, unknown>;
      const vote = new DocumentRequestVote({
        id: r.id,
        documentRequestId: r.documentRequestId,
        committeeMemberId: r.committeeMemberId ?? undefined,
        vote: r.vote as VoteChoice,
        recordedByAdminId: r.recordedByAdminId ?? undefined,
        createdAt: r.createdAt,
      });
      (vote as unknown as Record<string, unknown>).committeeMember = row.committeeMember;
      return vote;
    });
  }

  async findByDocumentRequestAndMember(
    documentRequestId: number,
    committeeMemberId: number,
  ): Promise<DocumentRequestVote | null> {
    const row = await DocumentRequestVoteModel.findOne({
      where: { documentRequestId, committeeMemberId },
    });
    if (!row) return null;

    return new DocumentRequestVote({
      id: row.id,
      documentRequestId: row.documentRequestId,
      committeeMemberId: row.committeeMemberId ?? undefined,
      vote: row.vote as VoteChoice,
      recordedByAdminId: row.recordedByAdminId ?? undefined,
      createdAt: row.createdAt,
    });
  }

  async deleteByDocumentRequestId(documentRequestId: number): Promise<void> {
    await DocumentRequestVoteModel.destroy({ where: { documentRequestId } });
  }
}
