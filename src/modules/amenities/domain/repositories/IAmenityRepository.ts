import { Amenity } from "../entities/Amenity";

export interface IAmenityRepository {
  create(amenity: Amenity): Promise<Amenity>;
  findById(id: number): Promise<Amenity | null>;
  findAll(activeOnly?: boolean): Promise<Amenity[]>;
  update(amenity: Amenity): Promise<Amenity>;
}