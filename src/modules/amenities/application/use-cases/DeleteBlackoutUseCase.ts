import { IBlackoutRepository } from "../../domain/repositories/IBlackoutRepository";

export class DeleteBlackoutUseCase {
  constructor(private readonly blackoutRepository: IBlackoutRepository) {}

  async execute(id: number): Promise<void> {
    await this.blackoutRepository.delete(id);
  }
}
