export enum VehicleType {
  CAR = "Car",
  BIKE = "Bike",
  SCOOTER = "Scooter",
  OTHER = "Other",
}

export enum FuelType {
  PETROL = "Petrol",
  DIESEL = "Diesel",
  ELECTRIC = "Electric",
  CNG = "CNG",
  HYBRID = "Hybrid",
}

export interface VehicleProps {
  id?: number;
  residentId: number;
  plateNumber: string;
  type: VehicleType;
  brandName: string;
  model: string;
  color: string;
  fuelType: FuelType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Vehicle {
  private props: VehicleProps;

  constructor(props: VehicleProps) {
    this.props = props;
  }

  public static create(
    props: Omit<VehicleProps, "id" | "isActive" | "createdAt" | "updatedAt">
  ): Vehicle {
    return new Vehicle({
      ...props,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get residentId(): number {
    return this.props.residentId;
  }

  get plateNumber(): string {
    return this.props.plateNumber;
  }

  get type(): VehicleType {
    return this.props.type;
  }

  get brandName(): string {
    return this.props.brandName;
  }

  get model(): string {
    return this.props.model;
  }

  get color(): string {
    return this.props.color;
  }

  get fuelType(): FuelType {
    return this.props.fuelType;
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

  updatePlateNumber(plateNumber: string): void {
    this.props.plateNumber = plateNumber; this.props.updatedAt = new Date();
  }

  updateType(type: VehicleType): void {
    this.props.type = type; this.props.updatedAt = new Date();
  }

  updateBrandName(brandName: string): void {
    this.props.brandName = brandName; this.props.updatedAt = new Date();
  }

  updateModel(model: string): void {
    this.props.model = model; this.props.updatedAt = new Date();
  }

  updateColor(color: string): void {
    this.props.color = color; this.props.updatedAt = new Date();
  }

  updateFuelType(fuelType: FuelType): void {
    this.props.fuelType = fuelType; this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false; this.props.updatedAt = new Date();
  }


  toResponseObject() {
    return {
      id: this.props.id,
      residentId: this.props.residentId,
      plateNumber: this.props.plateNumber,
      type: this.props.type,
      brandName: this.props.brandName,
      model: this.props.model,
      color: this.props.color,
      fuelType: this.props.fuelType,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}