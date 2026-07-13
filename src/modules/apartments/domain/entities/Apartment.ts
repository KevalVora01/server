export enum ApartmentType {
  STUDIO = "studio",
  ONE_BHK = "1bhk",
  TWO_BHK = "2bhk",
  THREE_BHK = "3bhk",
  FOUR_BHK = "4bhk",
}

export interface ApartmentProps {
  id?: number;
  block: string;
  floorNumber: number;
  unitNumber: string;
  areaSqft: number;
  type: ApartmentType;
  createdAt: Date;
  updatedAt: Date;
}

export class Apartment {
  private props: ApartmentProps;

  constructor(props: ApartmentProps) {
    this.props = props;
  }

  public static create(
    props: Omit<ApartmentProps, "id" | "createdAt" | "updatedAt">
  ): Apartment {
    return new Apartment({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get block(): string {
    return this.props.block;
  }

  get floorNumber(): number {
    return this.props.floorNumber;
  }

  get unitNumber(): string {
    return this.props.unitNumber;
  }

  get areaSqft(): number {
    return this.props.areaSqft;
  }

  get type(): ApartmentType {
    return this.props.type;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get displayName(): string {
    return `${this.block}-${this.floorNumber}${this.unitNumber}`;
  }

  updateDetails(props: Partial<Omit<ApartmentProps, "id" | "createdAt" | "updatedAt">>): void {
    if (props.block !== undefined) this.props.block = props.block;
    if (props.floorNumber !== undefined) this.props.floorNumber = props.floorNumber;
    if (props.unitNumber !== undefined) this.props.unitNumber = props.unitNumber.padStart(2, '0');
    if (props.areaSqft !== undefined) this.props.areaSqft = props.areaSqft;
    if (props.type !== undefined) this.props.type = props.type;
    this.props.updatedAt = new Date();
  }

  toResponseObject(isOccupied?: boolean) {
    return {
      id: this.props.id,
      block: this.props.block,
      floorNumber: this.props.floorNumber,
      unitNumber: this.props.unitNumber,
      displayName: this.displayName,
      areaSqft: this.props.areaSqft,
      type: this.props.type,
      createdAt: this.props.createdAt,
      isOccupied: isOccupied ?? false,
    };
  }
}