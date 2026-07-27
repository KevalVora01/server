import { INoticeRepository } from "../../domain/repositories/INoticeRepository";
import { NoticeNotFoundError } from "../../domain/errors/NoticeErrors";

export class DeleteNoticeUseCase {
  constructor(
    private readonly noticeRepository: INoticeRepository,
  ) {}

  async execute(id: number): Promise<void> {
    // 1. Check notice exists
    const notice = await this.noticeRepository.findById(id);
    if (!notice) throw new NoticeNotFoundError();

    // 2. Delete
    await this.noticeRepository.delete(id);
  }
}