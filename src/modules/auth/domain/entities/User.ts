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
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  get id(): number {
    return this.props.id?? -1;
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

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateName(name: string): void {
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

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  hasRole(role: UserRole): boolean {
    return this.props.role === role;
  }

  toJSON() {
    return {
      id: this.props.id,
      name: this.props.name,
      email: this.props.email,
      phone: this.props.phone,
      role: this.props.role,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}