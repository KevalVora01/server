import { TenantRequestVote } from "../entities/TenantRequestVote";

export interface ITenantRequestVoteRepository {
  create(vote: TenantRequestVote): Promise<TenantRequestVote>;
  findByRequestId(tenantRequestId: number): Promise<TenantRequestVote[]>;
  findByRequestAndMember(tenantRequestId: number, committeeMemberId: number): Promise<TenantRequestVote | null>;
  countByRequestId(tenantRequestId: number): Promise<{ approve: number; reject: number; total: number }>;
}