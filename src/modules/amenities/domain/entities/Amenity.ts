export interface AmenityProps {
  id?: number;
  name: string;
  description?: string | null;
  capacity?: number | null;
  operatingStart: string;
  operatingEnd: string;
  price?: number;
  images?: string[];
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
  price: number;
  images: string[];
  isActive: boolean;
  readonly createdAt: Date;

  constructor(props: AmenityProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description ?? null;
    this.capacity = props.capacity ?? null;
    this.operatingStart = props.operatingStart;
    this.operatingEnd = props.operatingEnd;
    this.price = props.price !== undefined && props.price !== null ? Number(props.price) : 0;
    const imgList = Array.isArray(props.images)
      ? props.images.filter((img) => typeof img === "string" && img.trim().length > 0)
      : [];
    this.images = imgList.slice(0, 5);
    this.isActive = props.isActive;
    this.createdAt = props.createdAt ?? new Date();
  }

  get primaryImageUrl(): string | null {
    return this.images[0] ?? null;
  }

  static create(props: AmenityProps): Amenity {
    if (!props.name?.trim()) {
      throw new Error("Amenity name is required");
    }
    if (props.operatingStart >= props.operatingEnd) {
      throw new Error("operatingStart must be before operatingEnd");
    }
    if (props.images && props.images.length > 5) {
      throw new Error("A maximum of 5 images is allowed per amenity");
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
      price: this.price,
      images: this.images,
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }
}