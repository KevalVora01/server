export class VisitorNotFoundError extends Error {
  constructor(id: number) {
    super(`Visitor with id ${id} not found`);
    this.name = "VisitorNotFoundError";
  }
}

export class VisitorNotPendingError extends Error {
  constructor() {
    super("This visitor request is not pending — it has already been decided");
    this.name = "VisitorNotPendingError";
  }
}

export class VisitorNotApprovedError extends Error {
  constructor() {
    super("Only an approved visitor can be checked in");
    this.name = "VisitorNotApprovedError";
  }
}

export class VisitorNotCheckedInError extends Error {
  constructor() {
    super("Only a checked-in visitor can be checked out");
    this.name = "VisitorNotCheckedInError";
  }
}

export class UnauthorizedVisitorAccessError extends Error {
  constructor() {
    super("You do not have permission to respond to this visitor request");
    this.name = "UnauthorizedVisitorAccessError";
  }
}

export class ResidentNotOccupantError extends Error {
  constructor() {
    super("Only the current occupant of the apartment can perform this action");
    this.name = "ResidentNotOccupantError";
  }
}