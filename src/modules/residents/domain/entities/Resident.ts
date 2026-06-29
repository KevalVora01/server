export interface ResidentProps {
  id?: number;
  userId: number;
  apartmentId: number;
  isOwner: boolean;
  moveInDate: Date;
  moveOutDate?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Resident {
  private props: ResidentProps;

  constructor(props: ResidentProps) {
    this.props = props;
  }

  public static create(
    props: Omit<ResidentProps, "id" | "isActive" | "createdAt" | "updatedAt">
  ): Resident {
    return new Resident({
      ...props,
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

  get moveInDate(): Date {
    return this.props.moveInDate;
  }

  get moveOutDate(): Date | null | undefined {
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

  updateMoveOutDate(moveOutDate: Date | string): void {
  this.props.moveOutDate = new Date(moveOutDate);
  this.props.updatedAt = new Date();
}

  toResponseObject() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      apartmentId: this.props.apartmentId,
      isOwner: this.props.isOwner,
      moveInDate: this.props.moveInDate,
      moveOutDate: this.props.moveOutDate,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt,
      user: (this as any).user ?? null,
      apartment: (this as any).apartment ?? null,
    };
  }
}