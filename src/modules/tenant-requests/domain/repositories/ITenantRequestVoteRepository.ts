import { TenantRequestVote } from "../entities/TenantRequestVote";

export interface ITenantRequestVoteRepository {
  create(vote: TenantRequestVote): Promise<TenantRequestVote>;
  update(vote: TenantRequestVote): Promise<TenantRequestVote>;
  replaceAllForRequest(
    tenantRequestId: number,
    votes: TenantRequestVote[],
    recordedByAdminId?: number
  ): Promise<TenantRequestVote[]>;
  findByRequestId(tenantRequestId: number): Promise<TenantRequestVote[]>;
  findByRequestAndMember(tenantRequestId: number, committeeMemberId: number): Promise<TenantRequestVote | null>;
  findByRequestAndAdmin(tenantRequestId: number, adminId: number): Promise<TenantRequestVote | null>;
  countByRequestId(tenantRequestId: number): Promise<{ approve: number; reject: number; total: number }>;
  countAdminVotes(tenantRequestId: number): Promise<{ approve: number; reject: number; total: number }>;
}