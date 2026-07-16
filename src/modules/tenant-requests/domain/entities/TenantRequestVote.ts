export enum VoteChoice {
  APPROVE = "Approve",
  REJECT = "Reject",
}

export interface TenantRequestVoteProps {
  id?: number;
  tenantRequestId: number;
  committeeMemberId: number;
  vote: VoteChoice;
  recordedByAdminId: number;
  createdAt?: Date;
}

export class TenantRequestVote {
  private props: TenantRequestVoteProps;

  constructor(props: TenantRequestVoteProps) {
    this.props = props;
  }

  public static create(
    props: Omit<TenantRequestVoteProps, "id" | "createdAt">
  ): TenantRequestVote {
    return new TenantRequestVote({
      ...props,
      createdAt: new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get tenantRequestId(): number {
    return this.props.tenantRequestId;
  }

  get committeeMemberId(): number {
    return this.props.committeeMemberId;
  }

  get vote(): VoteChoice {
    return this.props.vote;
  }

  get recordedByAdminId(): number {
    return this.props.recordedByAdminId;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  toResponseObject() {
    return {
      id: this.props.id,
      tenantRequestId: this.props.tenantRequestId,
      committeeMemberId: this.props.committeeMemberId,
      vote: this.props.vote,
      recordedByAdminId: this.props.recordedByAdminId,
      createdAt: this.props.createdAt,
      committeeMember: (this as any).committeeMember ?? null,
    };
  }
}