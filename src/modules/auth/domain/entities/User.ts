export enum UserRole {
  ADMIN = "admin",
  RESIDENT = "resident",
  SECURITY = "security",
}

export interface UserProps {
  id?: number;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  mustResetPassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  public static create(
    props: Omit<UserProps, 'id' | 'isActive' | 'mustResetPassword' | 'createdAt' | 'updatedAt'>
  ): User {
    return new User({
      ...props,
      isActive: true,
      mustResetPassword: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get phone(): string {
    return this.props.phone;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get mustResetPassword(): boolean {
    return this.props.mustResetPassword;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) throw new Error("Name cannot be empty");
    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  updatePhone(phone: string): void {
    this.props.phone = phone;
    this.props.updatedAt = new Date();
  }

  updatePassword(hashedPassword: string): void {
    this.props.passwordHash = hashedPassword;
    this.props.updatedAt = new Date();
  }

  requirePasswordReset(): void {
    this.props.mustResetPassword = true;
    this.props.updatedAt = new Date();
  }

  clearPasswordReset(): void {
    this.props.mustResetPassword = false;
    this.props.updatedAt = new Date();
  }

  reactivate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  toResponseObject() {
    return {
      id: this.props.id,
      name: this.props.name,
      email: this.props.email,
      phone: this.props.phone,
      role: this.props.role,
      isActive: this.props.isActive,
      mustResetPassword: this.props.mustResetPassword,
      createdAt: this.props.createdAt,
    };
  }
}