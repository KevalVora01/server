export class SlotConflictError extends Error {
  readonly statusCode = 409;
  constructor(message = "This time slot overlaps with an existing booking") {
    super(message);
    this.name = "SlotConflictError";
  }
}

export class OutsideOperatingHoursError extends Error {
  readonly statusCode = 400;
  constructor(message = "Requested time is outside the amenity's operating hours") {
    super(message);
    this.name = "OutsideOperatingHoursError";
  }
}

export class BlackoutConflictError extends Error {
  readonly statusCode = 409;
  constructor(message = "This time slot falls within a blackout period") {
    super(message);
    this.name = "BlackoutConflictError";
  }
}

export class BookingNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message = "Booking not found") {
    super(message);
    this.name = "BookingNotFoundError";
  }
}

export class BookingAlreadyPaidError extends Error {
  readonly statusCode = 400;
  constructor(message = "Booking has already been paid for") {
    super(message);
    this.name = "BookingAlreadyPaidError";
  }
}

export class InvalidUpiRefError extends Error {
  readonly statusCode = 400;
  constructor(message = "Payment reference is not a valid UPI reference") {
    super(message);
    this.name = "InvalidUpiRefError";
  }
}

export class OnlyUpiPaymentAllowedError extends Error {
  readonly statusCode = 400;
  constructor(message = "Only UPI payment is supported for bookings") {
    super(message);
    this.name = "OnlyUpiPaymentAllowedError";
  }
}

export class UnauthorizedBookingAccessError extends Error {
  readonly statusCode = 403;
  constructor(message = "You do not have access to this booking") {
    super(message);
    this.name = "UnauthorizedBookingAccessError";
  }
}

export class DuplicateVoteError extends Error {
  readonly statusCode = 409;
  constructor(message = "You have already voted on this booking") {
    super(message);
    this.name = "DuplicateVoteError";
  }
}

export class NotEligibleToVoteError extends Error {
  readonly statusCode = 403;
  constructor(message = "Only committee members and admin may vote on bookings") {
    super(message);
    this.name = "NotEligibleToVoteError";
  }
}

export class VotingClosedError extends Error {
  readonly statusCode = 400;
  constructor(message = "Voting on this booking is already closed") {
    super(message);
    this.name = "VotingClosedError";
  }
}

export class AmenityNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message = "Amenity not found") {
    super(message);
    this.name = "AmenityNotFoundError";
  }
}

export class AmenityNotActiveError extends Error {
  readonly statusCode = 400;
  constructor(message = "This amenity is not currently available for booking") {
    super(message);
    this.name = "AmenityNotActiveError";
  }
}

export class ResidentNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message = "Resident not found") {
    super(message);
    this.name = "ResidentNotFoundError";
  }
}