export enum NoticeCategory {
  GENERAL = "General",
  MAINTENANCE = "Maintenance",
  EMERGENCY = "Emergency",
  EVENT = "Event",
}

export interface NoticeProps {
  id?: number;
  adminId: number;
  title: string;
  body: string;
  category: NoticeCategory;
  isPinned: boolean;
  isActive: boolean;
  publishedAt?: Date;
  updatedAt?: Date;
}

export class Notice {
  private props: NoticeProps;

  constructor(props: NoticeProps) {
    this.props = props;
  }

  public static create(
    props: Omit<NoticeProps, "id" | "isPinned" | "isActive" | "publishedAt" | "updatedAt">
  ): Notice {
    return new Notice({
      ...props,
      isPinned: false,
      isActive: true,
      publishedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get adminId(): number {
    return this.props.adminId;
  }

  get title(): string {
    return this.props.title;
  }

  get body(): string {
    return this.props.body;
  }

  get category(): NoticeCategory {
    return this.props.category;
  }

  get isPinned(): boolean {
    return this.props.isPinned;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get publishedAt(): Date | undefined {
    return this.props.publishedAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  updateTitle(title: string): void {
    this.props.title = title; this.props.updatedAt = new Date();
  }

  updateBody(body: string): void {
    this.props.body = body; this.props.updatedAt = new Date();
  }

  updateCategory(category: NoticeCategory): void {
    this.props.category = category; this.props.updatedAt = new Date();
  }

  pin(): void {
    this.props.isPinned = true; this.props.updatedAt = new Date();
  }

  unpin(): void {
    this.props.isPinned = false; this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false; this.props.updatedAt = new Date();
  }


  toResponseObject() {
    return {
      id: this.props.id,
      adminId: this.props.adminId,
      title: this.props.title,
      body: this.props.body,
      category: this.props.category,
      isPinned: this.props.isPinned,
      isActive: this.props.isActive,
      publishedAt: this.props.publishedAt,
      updatedAt: this.props.updatedAt,
    };
  }
}