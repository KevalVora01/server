export enum TenantRequestStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

export interface TenantRequestProps {
  id?: number;
  apartmentId: number;
  requestedBy: number; // resident id of the Owner
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  moveInDate: Date;
  status: TenantRequestStatus;
  createdAt?: Date;
  decidedAt?: Date | null;
}

export class TenantRequest {
  public owner?: Record<string, unknown> | null;
  public apartment?: Record<string, unknown> | null;
  private props: TenantRequestProps;

  constructor(props: TenantRequestProps) {
    this.props = props;
  }

  public static create(
    props: Omit<TenantRequestProps, "id" | "status" | "createdAt" | "decidedAt">
  ): TenantRequest {
    return new TenantRequest({
      ...props,
      status: TenantRequestStatus.PENDING,
      createdAt: new Date(),
      decidedAt: null,
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get apartmentId(): number {
    return this.props.apartmentId;
  }

  get requestedBy(): number {
    return this.props.requestedBy;
  }

  get tenantName(): string {
    return this.props.tenantName;
  }

  get tenantEmail(): string {
    return this.props.tenantEmail;
  }

  get tenantPhone(): string {
    return this.props.tenantPhone;
  }

  get moveInDate(): Date {
    return this.props.moveInDate;
  }

  get status(): TenantRequestStatus {
    return this.props.status;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get decidedAt(): Date | null | undefined {
    return this.props.decidedAt;
  }

  isPending(): boolean {
    return this.props.status === TenantRequestStatus.PENDING;
  }

  approve(): void {
    if (!this.isPending()) {
      throw new Error("Only a pending request can be approved");
    }
    this.props.status = TenantRequestStatus.APPROVED;
    this.props.decidedAt = new Date();
  }

  reject(): void {
    if (!this.isPending()) {
      throw new Error("Only a pending request can be rejected");
    }
    this.props.status = TenantRequestStatus.REJECTED;
    this.props.decidedAt = new Date();
  }

  toResponseObject() {
    return {
      id: this.props.id,
      apartmentId: this.props.apartmentId,
      requestedBy: this.props.requestedBy,
      tenantName: this.props.tenantName,
      tenantEmail: this.props.tenantEmail,
      tenantPhone: this.props.tenantPhone,
      moveInDate: this.props.moveInDate,
      status: this.props.status,
      createdAt: this.props.createdAt,
      decidedAt: this.props.decidedAt,
      owner: this.owner ?? null,
      apartment: this.apartment ?? null,
    };
  }
}