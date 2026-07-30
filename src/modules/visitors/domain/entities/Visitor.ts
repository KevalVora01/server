export enum VisitorStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  CHECKED_IN = "CheckedIn",
  CHECKED_OUT = "CheckedOut",
}

export interface VisitorProps {
  id?: number;
  apartmentId: number;
  residentId: number;
  name: string;
  phone: string;
  purpose: string;
  photoUrl?: string | null;
  vehicleNumber?: string | null;
  isPreRegistered: boolean;
  expectedAt?: Date | null;
  status: VisitorStatus;
  approvalRequestedAt?: Date | null;
  checkedInAt?: Date | null;
  checkedOutAt?: Date | null;
  loggedBySecurityId?: number | null;
  photoUploadedAt?: Date | null;
  createdAt: Date;
}

export class Visitor {
  private props: VisitorProps;

  constructor(props: VisitorProps) {
    this.props = props;
  }

  public static createPreRegistered(
    props: Omit<VisitorProps, "id" | "status" | "isPreRegistered" | "approvalRequestedAt" | "checkedInAt" | "checkedOutAt" | "loggedBySecurityId" | "createdAt" | "photoUrl" | "photoUploadedAt">
  ): Visitor {
    return new Visitor({
      ...props,
      isPreRegistered: true,
      status: VisitorStatus.APPROVED,
      photoUrl: null,
      vehicleNumber: props.vehicleNumber ?? null,
      approvalRequestedAt: null,
      checkedInAt: null,
      checkedOutAt: null,
      loggedBySecurityId: null,
      photoUploadedAt: null,
      createdAt: new Date(),
    });
  }

  public static createWalkIn(
    props: Omit<VisitorProps, "id" | "status" | "isPreRegistered" | "expectedAt" | "checkedInAt" | "checkedOutAt" | "createdAt">
  ): Visitor {
    return new Visitor({
      ...props,
      isPreRegistered: false,
      status: VisitorStatus.PENDING,
      expectedAt: null,
      approvalRequestedAt: new Date(),
      checkedInAt: null,
      checkedOutAt: null,
      photoUploadedAt: props.photoUrl ? new Date() : null,
      createdAt: new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get apartmentId(): number {
    return this.props.apartmentId;
  }

  get residentId(): number {
    return this.props.residentId;
  }

  get name(): string {
    return this.props.name;
  }

  get phone(): string {
    return this.props.phone;
  }

  get purpose(): string {
    return this.props.purpose;
  }

  get photoUrl(): string | null | undefined {
    return this.props.photoUrl;
  }

  get vehicleNumber(): string | null | undefined {
    return this.props.vehicleNumber;
  }

  get isPreRegistered(): boolean {
    return this.props.isPreRegistered;
  }

  get expectedAt(): Date | null | undefined {
    return this.props.expectedAt;
  }

  get status(): VisitorStatus {
    return this.props.status;
  }

  get approvalRequestedAt(): Date | null | undefined {
    return this.props.approvalRequestedAt;
  }

  get checkedInAt(): Date | null | undefined {
    return this.props.checkedInAt;
  }

  get checkedOutAt(): Date | null | undefined {
    return this.props.checkedOutAt;
  }

  get loggedBySecurityId(): number | null | undefined {
    return this.props.loggedBySecurityId;
  }

  get photoUploadedAt(): Date | null | undefined {
    return this.props.photoUploadedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  isPending(): boolean {
    return this.props.status === VisitorStatus.PENDING;
  }

  approve(): void {
    if (!this.isPending()) {
      throw new Error("Only a pending visitor can be approved");
    }
    this.props.status = VisitorStatus.APPROVED;
  }

  reject(): void {
    if (!this.isPending()) {
      throw new Error("Only a pending visitor can be rejected");
    }
    this.props.status = VisitorStatus.REJECTED;
  }

  checkIn(securityUserId: number): void {
    if (this.props.status !== VisitorStatus.APPROVED) {
      throw new Error("Only an approved visitor can be checked in");
    }
    this.props.status = VisitorStatus.CHECKED_IN;
    this.props.checkedInAt = new Date();
    this.props.loggedBySecurityId = securityUserId;
  }

  checkOut(): void {
    if (this.props.status !== VisitorStatus.CHECKED_IN) {
      throw new Error("Only a checked-in visitor can be checked out");
    }
    this.props.status = VisitorStatus.CHECKED_OUT;
    this.props.checkedOutAt = new Date();
  }

  clearPhoto(): void {
    this.props.photoUrl = null;
    this.props.photoUploadedAt = null;
  }

  setPhoto(photoUrl: string): void {
    this.props.photoUrl = photoUrl;
    this.props.photoUploadedAt = new Date();
  }

  toResponseObject() {
    return {
      id: this.props.id,
      apartmentId: this.props.apartmentId,
      residentId: this.props.residentId,
      name: this.props.name,
      phone: this.props.phone,
      purpose: this.props.purpose,
      photoUrl: this.props.photoUrl,
      vehicleNumber: this.props.vehicleNumber,
      isPreRegistered: this.props.isPreRegistered,
      expectedAt: this.props.expectedAt,
      status: this.props.status,
      approvalRequestedAt: this.props.approvalRequestedAt,
      checkedInAt: this.props.checkedInAt,
      checkedOutAt: this.props.checkedOutAt,
      loggedBySecurityId: this.props.loggedBySecurityId,
      photoUploadedAt: this.props.photoUploadedAt,
      createdAt: this.props.createdAt,
      resident: (this as any).resident ?? null,
      apartment: (this as any).apartment ?? null,
    };
  }
}