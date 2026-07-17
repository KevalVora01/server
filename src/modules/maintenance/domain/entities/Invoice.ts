export enum InvoiceStatus {
  PENDING = "Pending",
  PAID = "Paid",
  OVERDUE = "Overdue",
}

export interface ExtraCharge {
  label: string;
  amount: number;
}

export interface InvoiceProps {
  id?: number;
  apartmentId: number;
  residentId?: number | null;
  month: number;
  year: number;
  baseAmount: number;
  extraCharges: ExtraCharge[];
  totalAmount: number;
  status: InvoiceStatus;
  dueDate: Date;
  paidAt?: Date | null;
  paymentRef?: string | null;
  pdfUrl?: string | null;
  createdAt?: Date;
  apartment?: {
    id: number;
    block: string;
    floorNumber: number;
    unitNumber: string;
  } | null;
  resident?: {
    id: number;
    userId: number;
    apartmentId: number;
    name?: string;
  } | null;
}

export class Invoice {
  private props: InvoiceProps;

  constructor(props: InvoiceProps) {
    this.props = props;
  }

  public static create(
    props: Omit<InvoiceProps, "id" | "extraCharges" | "totalAmount" | "status" | "paidAt" | "paymentRef" | "pdfUrl" | "createdAt">
  ): Invoice {
    return new Invoice({
      ...props,
      residentId: props.residentId ?? null,
      extraCharges: [],
      totalAmount: props.baseAmount,
      status: InvoiceStatus.PENDING,
      paidAt: null,
      paymentRef: null,
      pdfUrl: null,
      createdAt: new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get apartmentId(): number {
    return this.props.apartmentId;
  }

  get residentId(): number | null | undefined {
    return this.props.residentId;
  }

  get month(): number {
    return this.props.month;
  }

  get year(): number {
    return this.props.year;
  }

  get baseAmount(): number {
    return this.props.baseAmount;
  }

  get extraCharges(): ExtraCharge[] {
    return this.props.extraCharges;
  }

  get totalAmount(): number {
    return this.props.totalAmount;
  }

  get status(): InvoiceStatus {
    return this.props.status;
  }

  get dueDate(): Date {
    return this.props.dueDate;
  }

  get paidAt(): Date | null | undefined {
    return this.props.paidAt;
  }

  get paymentRef(): string | null | undefined {
    return this.props.paymentRef;
  }

  get pdfUrl(): string | null | undefined {
    return this.props.pdfUrl;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  isPaid(): boolean {
    return this.props.status === InvoiceStatus.PAID;
  }

  isOverdue(): boolean {
    return this.props.status === InvoiceStatus.OVERDUE;
  }

  setExtraCharges(charges: ExtraCharge[]): void {
    this.props.extraCharges = charges;
  }

  setTotalAmount(amount: number): void {
    this.props.totalAmount = amount;
  }

  setPdfUrl(url: string): void {
    this.props.pdfUrl = url;
  }

  markOverdue(): void {
    if (this.props.status !== InvoiceStatus.PENDING) return;
    this.props.status = InvoiceStatus.OVERDUE;
  }

  markPaid(paymentRef: string, paidAt: Date = new Date()): void {
    this.props.status = InvoiceStatus.PAID;
    this.props.paidAt = paidAt;
    this.props.paymentRef = paymentRef;
  }

  toResponseObject() {
    return {
      id: this.props.id,
      apartmentId: this.props.apartmentId,
      residentId: this.props.residentId,
      month: this.props.month,
      year: this.props.year,
      baseAmount: this.props.baseAmount,
      extraCharges: this.props.extraCharges,
      totalAmount: this.props.totalAmount,
      status: this.props.status,
      dueDate: this.props.dueDate,
      paidAt: this.props.paidAt,
      paymentRef: this.props.paymentRef,
      pdfUrl: this.props.pdfUrl,
      createdAt: this.props.createdAt,
      apartment: this.props.apartment,
      resident: this.props.resident,
    };
  }
}