import { INoticeRepository } from "../../domain/repositories/INoticeRepository";
import { Notice } from "../../domain/entities/Notice";
import { NoticeNotFoundError } from "../../domain/errors/NoticeErrors";

export class GetNoticeUseCase {
  constructor(
    private readonly noticeRepository: INoticeRepository,
  ) {}

  async execute(id: number): Promise<Notice> {
    const notice = await this.noticeRepository.findById(id);
    if (!notice) throw new NoticeNotFoundError();
    return notice;
  }
}