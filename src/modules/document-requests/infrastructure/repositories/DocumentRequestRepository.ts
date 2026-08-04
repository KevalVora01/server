import { Op } from "sequelize";
import { IDocumentRequestRepository, IDocumentRequestDetail } from "../../domain/repositories/IDocumentRequestRepository";
import { DocumentRequest, DocumentRequestStatus, RequestRole } from "../../domain/entities/DocumentRequest";
import { DocumentRequestVote, VoteChoice } from "../../domain/entities/DocumentRequestVote";
import { DocumentRequestModel } from "../models/DocumentRequestModel";
import { DocumentRequestVoteModel } from "../models/DocumentRequestVoteModel";
import { ApartmentModel } from "../../../apartments/infrastructure/models/ApartmentModel";
import { ResidentModel } from "../../../residents/infrastructure/models/ResidentModel";
import { UserModel } from "../../../auth/infrastructure/models/UserModel";

export class DocumentRequestRepository implements IDocumentRequestRepository {
  private toEntity(model: DocumentRequestModel): DocumentRequest {
    const entity = new DocumentRequest({
      id: model.id,
      apartmentId: model.apartmentId,
      requesterId: model.requesterId,
      requesterRole: model.requesterRole as RequestRole,
      targetId: model.targetId,
      targetRole: model.targetRole as RequestRole,
      documentType: model.documentType,
      customDocumentName: model.customDocumentName,
      note: model.note,
      status: model.status as DocumentRequestStatus,
      documentUrl: model.documentUrl,
      documentFileName: model.documentFileName,
      rejectionReason: model.rejectionReason,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });

    const relModel = model as DocumentRequestModel & { apartment?: Record<string, unknown> | null; requester?: Record<string, unknown> | null; target?: Record<string, unknown> | null };
    entity.apartment = relModel.apartment ?? null;
    entity.requester = relModel.requester ?? null;
    entity.target = relModel.target ?? null;

    return entity;
  }

  async create(request: DocumentRequest): Promise<DocumentRequest> {
    const props = request.toPrimitives();
    const created = await DocumentRequestModel.create({
      apartmentId: props.apartmentId,
      requesterId: props.requesterId,
      requesterRole: props.requesterRole,
      targetId: props.targetId,
      targetRole: props.targetRole,
      documentType: props.documentType,
      customDocumentName: props.customDocumentName ?? null,
      note: props.note ?? null,
      status: props.status,
    });

    return this.toEntity(created);
  }

  async findById(id: number): Promise<DocumentRequest | null> {
    const model = await DocumentRequestModel.findByPk(id);
    if (!model) return null;
    return this.toEntity(model);
  }

  async findMyRequests(residentId: number): Promise<DocumentRequest[]> {
    const models = await DocumentRequestModel.findAll({
      where: { requesterId: residentId },
      include: [
        { model: ApartmentModel, as: "apartment", required: false },
        {
          model: ResidentModel,
          as: "target",
          required: false,
          include: [
            { model: UserModel, as: "user", attributes: ["id", "name", "email", "phone"], required: false },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return models.map((m) => this.toEntity(m));
  }

  async findReceivedRequests(residentId: number): Promise<DocumentRequest[]> {
    const models = await DocumentRequestModel.findAll({
      where: { targetId: residentId },
      include: [
        { model: ApartmentModel, as: "apartment", required: false },
        {
          model: ResidentModel,
          as: "requester",
          required: false,
          include: [
            { model: UserModel, as: "user", attributes: ["id", "name", "email", "phone"], required: false },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return models.map((m) => this.toEntity(m));
  }

  async findAdminReceivedRequests(): Promise<DocumentRequest[]> {
    const models = await DocumentRequestModel.findAll({
      where: { targetRole: RequestRole.ADMIN },
      include: [
        { model: ApartmentModel, as: "apartment", required: false },
        {
          model: ResidentModel,
          as: "requester",
          required: false,
          include: [
            { model: UserModel, as: "user", attributes: ["id", "name", "email", "phone"], required: false },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return models.map((m) => this.toEntity(m));
  }

  async findWithDetail(id: number): Promise<IDocumentRequestDetail | null> {
    const model = await DocumentRequestModel.findByPk(id, {
      include: [
        { model: ApartmentModel, as: "apartment", required: false },
        {
          model: ResidentModel,
          as: "requester",
          required: false,
          include: [
            { model: UserModel, as: "user", attributes: ["id", "name", "email", "phone"], required: false },
          ],
        },
        {
          model: ResidentModel,
          as: "target",
          required: false,
          include: [
            { model: UserModel, as: "user", attributes: ["id", "name", "email", "phone"], required: false },
          ],
        },
      ],
    });

    if (!model) return null;

    const request = this.toEntity(model);

    const voteRows = await DocumentRequestVoteModel.findAll({
      where: { documentRequestId: id },
      include: [
        {
          model: ResidentModel,
          as: "committeeMember",
          attributes: ["id", "apartmentId"],
          include: [
        { model: UserModel, as: "user", attributes: ["id", "name", "email"], required: false },
          ],
        },
      ],
    });

    const votes = voteRows.map((r) => {
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

    const committeeRows = await ResidentModel.findAll({
      where: { isCommitteeMember: true },
      attributes: ["id", "apartmentId"],
      include: [
        { model: UserModel, as: "user", attributes: ["id", "name", "email"], required: false },
      ],
    });

    return {
      request,
      votes,
      committeeMembers: committeeRows.map((m) => {
        const row = m as unknown as Record<string, unknown>;
        const user = (row.user ?? {}) as Record<string, unknown>;
        return { id: m.id, fullName: (user.name as string) ?? `Member #${m.id}`, email: (user.email as string) ?? '', apartmentId: m.apartmentId };
      }),
    };
  }

  async update(request: DocumentRequest): Promise<DocumentRequest> {
    const props = request.toPrimitives();
    await DocumentRequestModel.update(
      {
        status: props.status,
        documentUrl: props.documentUrl ?? null,
        documentFileName: props.documentFileName ?? null,
        rejectionReason: props.rejectionReason ?? null,
      },
      { where: { id: props.id } }
    );

    const updated = await DocumentRequestModel.findByPk(props.id);
    return this.toEntity(updated!);
  }

  async delete(id: number): Promise<void> {
    await DocumentRequestModel.destroy({ where: { id } });
  }
}
