import { VoteChoice } from "../../../../shared/voting";
export { VoteChoice };


export interface DocumentRequestVoteProps {
  id?: number;
  documentRequestId: number;
  committeeMemberId?: number;
  vote: VoteChoice;
  recordedByAdminId?: number;
  createdAt?: Date;
}

export class DocumentRequestVote {
  public committeeMember?: Record<string, unknown> | null;
  private props: DocumentRequestVoteProps;

  constructor(props: DocumentRequestVoteProps) {
    this.props = props;
  }

  public static create(
    props: Omit<DocumentRequestVoteProps, "id" | "createdAt">
  ): DocumentRequestVote {
    return new DocumentRequestVote({
      ...props,
      createdAt: new Date(),
    });
  }

  get id(): number | undefined { return this.props.id; }
  get documentRequestId(): number { return this.props.documentRequestId; }
  get committeeMemberId(): number | undefined { return this.props.committeeMemberId; }
  get vote(): VoteChoice { return this.props.vote; }
  get recordedByAdminId(): number | undefined { return this.props.recordedByAdminId; }
  get createdAt(): Date | undefined { return this.props.createdAt; }

  isAdminVote(): boolean {
    return !this.props.committeeMemberId && !!this.props.recordedByAdminId;
  }

  changeVote(vote: VoteChoice): void {
    this.props.vote = vote;
  }

  recordByAdmin(adminId: number): void {
    this.props.recordedByAdminId = adminId;
  }

  toResponseObject() {
    return {
      id: this.props.id,
      documentRequestId: this.props.documentRequestId,
      committeeMemberId: this.props.committeeMemberId,
      vote: this.props.vote,
      recordedByAdminId: this.props.recordedByAdminId,
      createdAt: this.props.createdAt,
      committeeMember: this.committeeMember ?? null,
    };
  }
}
