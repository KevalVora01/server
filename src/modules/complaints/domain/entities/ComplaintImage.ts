export interface ComplaintImageProps {
  id?: number;
  complaintId: number;
  imageUrl: string;
  createdAt: Date;
}

export class ComplaintImage {
  private props: ComplaintImageProps;

  constructor(props: ComplaintImageProps) {
    this.props = props;
  }

  public static create(
    props: Omit<ComplaintImageProps, "id" | "createdAt">
  ): ComplaintImage {
    if (!props.imageUrl) {
      throw new Error("Image URL is required");
    }

    return new ComplaintImage({
      ...props,
      createdAt: new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get complaintId(): number {
    return this.props.complaintId;
  }

  get imageUrl(): string {
    return this.props.imageUrl;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toResponseObject() {
    return {
      id: this.props.id,
      complaintId: this.props.complaintId,
      imageUrl: this.props.imageUrl,
      createdAt: this.props.createdAt,
    };
  }
}