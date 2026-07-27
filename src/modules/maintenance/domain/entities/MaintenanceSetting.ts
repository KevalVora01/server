export interface MaintenanceSettingProps {
  id?: number;
  amount: number;
  updatedAt: Date;
}

export class MaintenanceSetting {
  private props: MaintenanceSettingProps;

  constructor(props: MaintenanceSettingProps) {
    this.props = props;
  }

  public static create(amount: number): MaintenanceSetting {
    return new MaintenanceSetting({
      amount,
      updatedAt: new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get amount(): number {
    return this.props.amount;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateAmount(newAmount: number): void {
    this.props.amount = newAmount;
    this.props.updatedAt = new Date();
  }

  toResponseObject() {
    return {
      id: this.props.id,
      amount: this.props.amount,
      updatedAt: this.props.updatedAt,
    };
  }
}