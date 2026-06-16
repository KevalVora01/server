export interface RefreshTokenProps {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export class RefreshToken {
  private props: RefreshTokenProps;

  constructor(props: RefreshTokenProps) {
    this.props = props;
  }

  get id(): number {
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

  get createdAt(): Date {
    return this.props.createdAt;
  }

  isExpired(): boolean {
    return this.props.expiresAt.getTime() < Date.now();
  }

  toJSON() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      expiresAt: this.props.expiresAt,
      createdAt: this.props.createdAt,
    };
  }
}