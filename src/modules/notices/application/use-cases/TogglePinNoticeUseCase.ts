import { INoticeRepository } from "../../domain/repositories/INoticeRepository";
import { Notice } from "../../domain/entities/Notice";
import { NoticeNotFoundError } from "../../domain/errors/NoticeErrors";

export class TogglePinNoticeUseCase {
  constructor(
    private readonly noticeRepository: INoticeRepository,
  ) {}

  async execute(id: number): Promise<Notice> {
    // 1. Check notice exists
    const notice = await this.noticeRepository.findById(id);
    if (!notice) throw new NoticeNotFoundError();

    // 2. Toggle pin
    if (notice.isPinned) {
      notice.unpin();
    } else {
      notice.pin();
    }

    // 3. Save to DB
    return await this.noticeRepository.update(notice);
  }
}