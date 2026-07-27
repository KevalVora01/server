export interface SubmitTenantRequestDto {
  apartmentId: number;
  requestedBy: number; // Owner's resident id
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  moveInDate: Date;
}