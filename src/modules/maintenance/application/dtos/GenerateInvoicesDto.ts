export interface GenerateInvoicesDto {
  month: number;
  year: number;
  dueDate: Date;
  extraCharges?: {
    label: string;
    amount: number;
  }[];
}