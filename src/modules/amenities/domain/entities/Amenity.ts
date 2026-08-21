export interface AmenityProps {
  id?: number;
  name: string;
  description?: string | null;
  capacity?: number | null;       // optional: max concurrent people, not slots
  operatingStart: string;         // "06:00" — 24hr format
  operatingEnd: string;           // "22:00"
  isActive: boolean;
  createdAt?: Date;
}

export class Amenity {
  readonly id?: number;
  name: string;
  description: string | null;
  capacity: number | null;
  operatingStart: string;
  operatingEnd: string;
  isActive: boolean;
  readonly createdAt: Date;

  constructor(props: AmenityProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description ?? null;
    this.capacity = props.capacity ?? null;
    this.operatingStart = props.operatingStart;
    this.operatingEnd = props.operatingEnd;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt ?? new Date();
  }

  static create(props: AmenityProps): Amenity {
    if (!props.name?.trim()) {
      throw new Error("Amenity name is required");
    }
    if (props.operatingStart >= props.operatingEnd) {
      throw new Error("operatingStart must be before operatingEnd");
    }
    return new Amenity({ ...props, isActive: props.isActive ?? true });
  }

  isWithinOperatingHours(startTime: string, endTime: string): boolean {
    return startTime >= this.operatingStart && endTime <= this.operatingEnd;
  }

  deactivate(): void {
    this.isActive = false;
  }

  activate(): void {
    this.isActive = true;
  }

  toResponseObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      capacity: this.capacity,
      operatingStart: this.operatingStart,
      operatingEnd: this.operatingEnd,
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }
}