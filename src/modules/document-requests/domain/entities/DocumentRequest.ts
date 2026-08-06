import { DocumentRequestNotFoundError } from "../errors/DocumentRequestErrors";

export enum DocumentRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  UPLOADED = "UPLOADED",
  REJECTED = "REJECTED",
}

export enum RequestRole {
  TENANT = "TENANT",
  OWNER = "OWNER",
  ADMIN = "ADMIN",
}

export interface DocumentRequestProps {
  id?: number;
  apartmentId: number;
  requesterId: number;
  requesterRole: RequestRole;
  targetId: number | null;
  targetRole: RequestRole;
  documentType: string;
  customDocumentName?: string | null;
  note?: string | null;
  status: DocumentRequestStatus;
  documentUrl?: string | null;
  documentFileName?: string | null;
  rejectionReason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DocumentRequest {
  public apartment?: Record<string, unknown> | null;
  public requester?: Record<string, unknown> | null;
  public target?: Record<string, unknown> | null;
  private props: DocumentRequestProps;

  constructor(props: DocumentRequestProps) {
    this.props = {
      ...props,
      status: props.status || DocumentRequestStatus.PENDING,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
  }

  public static create(
    props: Omit<DocumentRequestProps, "id" | "status" | "createdAt" | "updatedAt">
  ): DocumentRequest {
    return new DocumentRequest({
      ...props,
      status: DocumentRequestStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  get id(): number | undefined { return this.props.id; }
  get apartmentId(): number { return this.props.apartmentId; }
  get requesterId(): number { return this.props.requesterId; }
  get requesterRole(): RequestRole { return this.props.requesterRole; }
  get targetId(): number | null { return this.props.targetId; }
  get targetRole(): RequestRole { return this.props.targetRole; }
  get documentType(): string { return this.props.documentType; }
  get customDocumentName(): string | null | undefined { return this.props.customDocumentName; }
  get note(): string | null | undefined { return this.props.note; }
  get status(): DocumentRequestStatus { return this.props.status; }
  get documentUrl(): string | null | undefined { return this.props.documentUrl; }
  get documentFileName(): string | null | undefined { return this.props.documentFileName; }
  get rejectionReason(): string | null | undefined { return this.props.rejectionReason; }
  get createdAt(): Date | undefined { return this.props.createdAt; }
  get updatedAt(): Date | undefined { return this.props.updatedAt; }

  fulfill(url: string, fileName: string): void {
    if (this.props.status !== DocumentRequestStatus.PENDING && this.props.status !== DocumentRequestStatus.APPROVED) {
      throw new DocumentRequestInvalidStateError();
    }
    this.props.documentUrl = url;
    this.props.documentFileName = fileName;
    this.props.status = DocumentRequestStatus.UPLOADED;
    this.props.updatedAt = new Date();
  }

  reject(reason?: string): void {
    if (this.props.status !== DocumentRequestStatus.PENDING && this.props.status !== DocumentRequestStatus.APPROVED) {
      throw new DocumentRequestInvalidStateError();
    }
    this.props.status = DocumentRequestStatus.REJECTED;
    this.props.rejectionReason = reason || "Request declined.";
    this.props.updatedAt = new Date();
  }

  approve(): void {
    if (this.props.status !== DocumentRequestStatus.PENDING) {
      throw new DocumentRequestInvalidStateError();
    }
    this.props.status = DocumentRequestStatus.APPROVED;
    this.props.updatedAt = new Date();
  }

  toResponseObject() {
    return {
      id: this.props.id,
      apartmentId: this.props.apartmentId,
      requesterId: this.props.requesterId,
      requesterRole: this.props.requesterRole,
      targetId: this.props.targetId,
      targetRole: this.props.targetRole,
      documentType: this.props.documentType,
      customDocumentName: this.props.customDocumentName,
      note: this.props.note,
      status: this.props.status,
      documentUrl: this.props.documentUrl,
      documentFileName: this.props.documentFileName,
      rejectionReason: this.props.rejectionReason,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      apartment: this.apartment ?? undefined,
      requester: this.requester ?? undefined,
      target: this.target ?? undefined,
    };
  }

  toPrimitives() {
    return { ...this.props };
  }
}

export class DocumentRequestInvalidStateError extends Error {
  constructor() {
    super("Document request has already been fulfilled or rejected.");
    this.name = "DocumentRequestInvalidStateError";
  }
}
