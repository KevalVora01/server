export enum FamilyRelation {
  SPOUSE = "Spouse",
  CHILD = "Child",
  PARENT = "Parent",
  SIBLING = "Sibling",
  OTHER = "Other",
}

export interface FamilyMemberProps {
  id?: number;
  residentId: number;
  name: string;
  relation: "Spouse" | "Child" | "Parent" | "Sibling" | "Other";
  age?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class FamilyMember {
  private props: FamilyMemberProps;

  constructor(props: FamilyMemberProps) {
    this.props = props;
  }

  public static create(
    props: Omit<FamilyMemberProps, "id" | "createdAt" | "updatedAt">
  ): FamilyMember {
    return new FamilyMember({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get residentId(): number {
    return this.props.residentId;
  }

  get name(): string {
    return this.props.name;
  }

  get relation(): string {
    return this.props.relation;
  }

  get age(): number | null | undefined {
    return this.props.age;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateName(name: string): void {
    this.props.name = name;
  }

  updateRelation(relation: FamilyMemberProps["relation"]): void {
    this.props.relation = relation;
  }

  updateAge(age: number | null): void {
    this.props.age = age;
  }

  toResponseObject() {
    return {
      id: this.props.id,
      residentId: this.props.residentId,
      name: this.props.name,
      relation: this.props.relation,
      age: this.props.age ?? null,
    };
  }
}