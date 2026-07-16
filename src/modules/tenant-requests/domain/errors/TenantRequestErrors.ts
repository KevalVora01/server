export class TenantRequestNotFoundError extends Error {
  constructor(id: number) {
    super(`Tenant request with id ${id} not found`);
    this.name = "TenantRequestNotFoundError";
  }
}

export class ApartmentAlreadyHasActiveTenantError extends Error {
  constructor() {
    super("This apartment already has an active tenant");
    this.name = "ApartmentAlreadyHasActiveTenantError";
  }
}

export class TenantRequestAlreadyDecidedError extends Error {
  constructor() {
    super("This tenant request has already been decided");
    this.name = "TenantRequestAlreadyDecidedError";
  }
}

export class DuplicateVoteError extends Error {
  constructor() {
    super("This committee member has already voted on this request");
    this.name = "DuplicateVoteError";
  }
}

export class NotACommitteeMemberError extends Error {
  constructor() {
    super("The specified resident is not a committee member");
    this.name = "NotACommitteeMemberError";
  }
}

export class NoActiveTenantToRevokeError extends Error {
  constructor() {
    super("This apartment has no active tenant to revoke");
    this.name = "NoActiveTenantToRevokeError";
  }
}

export class VotingNotCompleteError extends Error {
  constructor() {
    super("Not all committee members have voted yet");
    this.name = "VotingNotCompleteError";
  }
}