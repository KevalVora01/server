import { VoteChoice } from "../../../../shared/voting";

export interface BookingVoteProps {
  id?: number;
  bookingId: number;
  committeeMemberId?: number | null;
  vote: VoteChoice;
  recordedByAdminId?: number | null;
  createdAt?: Date;
}

export class BookingVote {
  readonly id?: number;
  readonly bookingId: number;
  readonly committeeMemberId: number | null;
  readonly vote: VoteChoice;
  readonly recordedByAdminId: number | null;
  readonly createdAt: Date;
  committeeMember?: {
    id: number;
    apartmentId: number;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  } | null;

  constructor(props: BookingVoteProps) {
    this.id = props.id;
    this.bookingId = props.bookingId;
    this.committeeMemberId = props.committeeMemberId ?? null;
    this.vote = props.vote;
    this.recordedByAdminId = props.recordedByAdminId ?? null;
    this.createdAt = props.createdAt ?? new Date();
  }

  static create(props: BookingVoteProps): BookingVote {
    return new BookingVote(props);
  }

  toResponseObject() {
    return {
      id: this.id,
      bookingId: this.bookingId,
      committeeMemberId: this.committeeMemberId,
      vote: this.vote,
      recordedByAdminId: this.recordedByAdminId,
      committeeMember: this.committeeMember,
      createdAt: this.createdAt,
    };
  }
}
