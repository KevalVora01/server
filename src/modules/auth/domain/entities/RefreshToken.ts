export interface RefreshTokenProps {
  id?: number;         
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export class RefreshToken {
  private props: RefreshTokenProps;

  constructor(props: RefreshTokenProps) {
    if (!props.token || props.token.trim().length === 0) {
      throw new Error("Token string cannot be empty");
    }
    this.props = props;
  }

  public static create(props: Omit<RefreshTokenProps, 'id' | 'createdAt'>): RefreshToken {
    return new RefreshToken({
      ...props,
      createdAt: new Date()
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

  get createdAt(): Date {
    return this.props.createdAt;
  }

  isExpired(): boolean {
    return this.props.expiresAt.getTime() < Date.now();
  }

  toObject() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      token: this.props.token,
      expiresAt: this.props.expiresAt,
      createdAt: this.props.createdAt,
    };
  }
}