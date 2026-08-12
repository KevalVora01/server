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

export class InvalidUpiRefError extends Error {
  constructor() {
    super("UPI UTR / Reference number must be a valid 12-digit transaction number");
    this.name = "InvalidUpiRefError";
  }
}

export class OnlyUpiPaymentAllowedError extends Error {
  constructor() {
    super("Only instant UPI digital payments are accepted. Cash and Cheque transactions have been disabled.");
    this.name = "OnlyUpiPaymentAllowedError";
  }
}

export class ResidentNotOccupantError extends Error {
  constructor() {
    super("Only the current occupant of the apartment can pay this invoice");
    this.name = "ResidentNotOccupantError";
  }
}