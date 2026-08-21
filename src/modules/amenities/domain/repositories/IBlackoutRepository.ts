import { Blackout } from "../entities/Blackout";

export interface IBlackoutRepository {
  create(blackout: Blackout): Promise<Blackout>;
  findById(id: number): Promise<Blackout | null>;
  findByAmenityAndDate(amenityId: number, date: string): Promise<Blackout[]>;
  findByAmenity(amenityId: number): Promise<Blackout[]>;
  delete(id: number): Promise<void>;
}