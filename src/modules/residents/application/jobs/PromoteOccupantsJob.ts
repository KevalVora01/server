import { IResidentRepository } from "../../domain/repositories/IResidentRepository";

export class PromoteOccupantsJob {
  constructor(
    private readonly residentRepository: IResidentRepository,
  ) { }

  async execute(): Promise<void> {
    const promoted = await this.residentRepository.promoteDueOccupants();
    if (promoted > 0) {
      console.log(`[Cron] Promoted ${promoted} resident(s) to occupant after move-in date`);
    }
  }
}
