export enum ComplaintPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export enum ComplaintStatus {
  OPEN = "Open",
  IN_PROGRESS = "In Progress",
  RESOLVED = "Resolved",
}

export interface ComplaintProps {
  id?: number;
  residentId: number;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date | null;
}

export class Complaint {
  private props: ComplaintProps;

  constructor(props: ComplaintProps) {
    this.props = props;
  }

  public static create(
    props: Omit<ComplaintProps, "id" | "status" | "createdAt" | "updatedAt" | "resolvedAt">
  ): Complaint {
    return new Complaint({
      ...props,
      status: ComplaintStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null,
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get residentId(): number {
    return this.props.residentId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get priority(): ComplaintPriority {
    return this.props.priority;
  }

  get status(): ComplaintStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get resolvedAt(): Date | null | undefined {
    return this.props.resolvedAt;
  }

  isResolved(): boolean {
    return this.props.status === ComplaintStatus.RESOLVED;
  }

  canAcceptComments(): boolean {
    return !this.isResolved();
  }

  private static readonly VALID_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
    [ComplaintStatus.OPEN]: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED],
    [ComplaintStatus.IN_PROGRESS]: [ComplaintStatus.OPEN, ComplaintStatus.RESOLVED],
    [ComplaintStatus.RESOLVED]: [],
  };

  canTransitionTo(newStatus: ComplaintStatus): boolean {
    if (this.isResolved()) return false;
    return Complaint.VALID_TRANSITIONS[this.props.status].includes(newStatus);
  }

  updateStatus(newStatus: ComplaintStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(`Cannot transition from ${this.props.status} to ${newStatus}`);
    }

    this.props.status = newStatus;
    this.props.updatedAt = new Date();

    if (newStatus === ComplaintStatus.RESOLVED) {
      this.props.resolvedAt = new Date();
    }
  }

  toResponseObject() {
    return {
      id: this.props.id,
      residentId: this.props.residentId,
      title: this.props.title,
      description: this.props.description,
      priority: this.props.priority,
      status: this.props.status,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      resolvedAt: this.props.resolvedAt,
    };
  }
}