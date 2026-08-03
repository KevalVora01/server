export interface PreRegisterVisitorDto {
  residentId: number;
  apartmentId: number;
  name: string;
  phone: string;
  purpose: string;
  expectedAt: Date;
  vehicleNumber?: string;
  photoUrl?: string;
}