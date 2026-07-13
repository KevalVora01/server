export class InvoiceNotFoundError extends Error {
  constructor(id: number) {
    super(`Invoice with id ${id} not found`);
    this.name = "InvoiceNotFoundError";
  }
}

export class InvoiceAlreadyPaidError extends Error {
  constructor() {
    super("This invoice has already been paid");
    this.name = "InvoiceAlreadyPaidError";
  }
}

export class UnauthorizedInvoiceAccessError extends Error {
  constructor() {
    super("You do not have permission to access this invoice");
    this.name = "UnauthorizedInvoiceAccessError";
  }
}

export class MaintenanceSettingNotFoundError extends Error {
  constructor() {
    super("Maintenance setting has not been configured yet");
    this.name = "MaintenanceSettingNotFoundError";
  }
}

export class InvalidPaymentAmountError extends Error {
  constructor() {
    super("Payment amount does not match the invoice total");
    this.name = "InvalidPaymentAmountError";
  }
}

export class InvalidChequeNumberError extends Error {
  constructor() {
    super("Cheque number must be exactly 6 digits");
    this.name = "InvalidChequeNumberError";
  }
}