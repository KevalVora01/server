import { IResidentRepository } from "../../domain/repositories/IResidentRepository";
import { Resident } from "../../domain/entities/Resident";
import { ResidentNotFoundError } from "../../domain/errors/ResidentErrors";

export class GetResidentUseCase {
  constructor(
    private readonly residentRepository: IResidentRepository
  ) {}

  async execute(id: number): Promise<Resident> {
    const resident = await this.residentRepository.findById(id);

    if (!resident) {
      throw new ResidentNotFoundError();
    }

    // if (!resident.isActive) {
    //   throw new ResidentNotFoundError(); // treat inactive as not found
    // }    

    return resident;
  }
}