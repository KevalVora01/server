export interface PasswordResetTokenProps {
  id?: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt?: Date;
}

export class PasswordResetToken {
  private props: PasswordResetTokenProps;

  constructor(props: PasswordResetTokenProps) {
    this.props = props;
  }

  public static create(userId: number, token: string, expiresInMinutes = 10): PasswordResetToken {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    return new PasswordResetToken({
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get userId(): number {
    return this.props.userId;
  }

  get token(): string {
    return this.props.token;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }
}