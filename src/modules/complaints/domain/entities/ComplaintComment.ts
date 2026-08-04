import { DomainValidationError } from "../errors/ComplaintErrors";

export interface ComplaintCommentProps {
  id?: number;
  complaintId: number;
  userId: number;
  content: string;
  createdAt: Date;
}

export class ComplaintComment {
  public user?: Record<string, unknown> | null;
  private props: ComplaintCommentProps;

  constructor(props: ComplaintCommentProps) {
    this.props = props;
  }

  public static create(
    props: Omit<ComplaintCommentProps, "id" | "createdAt">
  ): ComplaintComment {
    if (!props.content || props.content.trim().length === 0) {
      throw new DomainValidationError("Comment content cannot be empty");
    }

    return new ComplaintComment({
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

  get userId(): number {
    return this.props.userId;
  }

  get content(): string {
    return this.props.content;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toResponseObject() {
    return {
      id: this.props.id,
      complaintId: this.props.complaintId,
      userId: this.props.userId,
      content: this.props.content,
      createdAt: this.props.createdAt,
      user: this.user ?? null,
    };
  }
}