export class TenantRequestNotFoundError extends Error {
  public readonly statusCode = 404;
  constructor(id: number) {
    super(`Tenant request with id ${id} not found`);
    this.name = "TenantRequestNotFoundError";
  }
}

export class ApartmentAlreadyHasActiveTenantError extends Error {
  public readonly statusCode = 409;
  constructor() {
    super("This apartment already has an active tenant");
    this.name = "ApartmentAlreadyHasActiveTenantError";
  }
}

export class TenantRequestAlreadyDecidedError extends Error {
  public readonly statusCode = 409;
  constructor() {
    super("This tenant request has already been decided");
    this.name = "TenantRequestAlreadyDecidedError";
  }
}

export class DuplicateVoteError extends Error {
  public readonly statusCode = 409;
  constructor() {
    super("This committee member has already voted on this request");
    this.name = "DuplicateVoteError";
  }
}

export class NotACommitteeMemberError extends Error {
  public readonly statusCode = 403;
  constructor() {
    super("The specified resident is not a committee member");
    this.name = "NotACommitteeMemberError";
  }
}

export class NoActiveTenantToRevokeError extends Error {
  public readonly statusCode = 400;
  constructor() {
    super("This apartment has no active tenant to revoke");
    this.name = "NoActiveTenantToRevokeError";
  }
}

export class VotingNotCompleteError extends Error {
  public readonly statusCode = 400;
  constructor() {
    super("Not all committee members have voted yet");
    this.name = "VotingNotCompleteError";
  }
}