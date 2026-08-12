export interface ResidentProps {
  id?: number;
  userId: number;
  apartmentId: number;
  isOwner: boolean;
  isCommitteeMember: boolean;
  isOccupant: boolean;
  moveInDate: Date | string;
  moveOutDate?: Date | string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Resident {
  public user?: unknown;
  public apartment?: unknown;
  private props: ResidentProps;

  constructor(props: ResidentProps) {
    this.props = props;
  }

  public static create(
    props: Omit<ResidentProps, "id" | "isCommitteeMember" | "isOccupant" | "isActive" | "createdAt" | "updatedAt">
  ): Resident {
    const moveInDateObj = typeof props.moveInDate === "string" ? new Date(props.moveInDate) : props.moveInDate;
    return new Resident({
      ...props,
      isCommitteeMember: false,
      isOccupant: moveInDateObj <= new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get userId(): number {
    return this.props.userId;
  }

  get apartmentId(): number {
    return this.props.apartmentId;
  }

  get isOwner(): boolean {
    return this.props.isOwner;
  }

  get isCommitteeMember(): boolean {
    return this.props.isCommitteeMember;
  }

  get isOccupant(): boolean {
    return this.props.isOccupant;
  }

  get moveInDate(): Date | string {
    return this.props.moveInDate;
  }

  get moveOutDate(): Date | string | null | undefined {
    return this.props.moveOutDate;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.isOccupant = false;
    this.props.updatedAt = new Date();
  }

  reactivate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  updateApartment(apartmentId: number): void {
    this.props.apartmentId = apartmentId;
    this.props.updatedAt = new Date();
  }

  updateIsOwner(isOwner: boolean): void {
    this.props.isOwner = isOwner;
    this.props.updatedAt = new Date();
  }

  updateMoveOutDate(moveOutDate: Date | string | null): void {
    this.props.moveOutDate = moveOutDate === null ? null : new Date(moveOutDate);
    this.props.updatedAt = new Date();
  }

  updateMoveInDate(moveInDate: Date | string): void {
    this.props.moveInDate = new Date(moveInDate);
    this.props.updatedAt = new Date();
  }

  setCommitteeMember(isCommitteeMember: boolean): void {
    this.props.isCommitteeMember = isCommitteeMember;
    this.props.updatedAt = new Date();
  }

  markAsOccupant(): void {
    this.props.isOccupant = true;
    this.props.updatedAt = new Date();
  }

  markAsNonOccupant(): void {
    this.props.isOccupant = false;
    this.props.updatedAt = new Date();
  }

  toResponseObject() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      apartmentId: this.props.apartmentId,
      isOwner: this.props.isOwner,
      isCommitteeMember: this.props.isCommitteeMember,
      isOccupant: this.props.isOccupant,
      moveInDate: this.props.moveInDate,
      moveOutDate: this.props.moveOutDate,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt,
      user: this.user ?? null,
      apartment: this.apartment ?? null,
    };
  }
}