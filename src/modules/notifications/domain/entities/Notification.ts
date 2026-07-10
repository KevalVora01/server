export type NotificationType =
  | "complaint_created"
  | "complaint_status_changed"
  | "notice_created"
  | "maintenance_due_soon"
  | "maintenance_due_today"
  | "maintenance_overdue"
  | "maintenance_overdue_reminder"
  | "maintenance_payment_succeeded";

export interface NotificationDataMap {
  complaint_created: { complaintId: number };
  complaint_status_changed: { complaintId: number; status: string };
  notice_created: { noticeId: number };
}

export interface NotificationProps {
  id?: number;
  userId: number;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

export class Notification {
  private props: NotificationProps;

  constructor(props: NotificationProps) {
    this.props = props;
  }

  public static create(
    props: Omit<NotificationProps, "id" | "isRead" | "createdAt">
  ): Notification {
    return new Notification({
      ...props,
      isRead: false,
      createdAt: new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get userId(): number {
    return this.props.userId;
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get body(): string {
    return this.props.body;
  }

  get data(): Record<string, unknown> {
    return this.props.data;
  }

  get isRead(): boolean {
    return this.props.isRead;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  markAsRead(): void {
    this.props.isRead = true;
  }

  toResponseObject() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      type: this.props.type,
      title: this.props.title,
      body: this.props.body,
      data: this.props.data,
      isRead: this.props.isRead,
      createdAt: this.props.createdAt,
    };
  }
}