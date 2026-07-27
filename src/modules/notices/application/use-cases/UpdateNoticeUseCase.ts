import { INoticeRepository } from "../../domain/repositories/INoticeRepository";
import { UpdateNoticeDto } from "../dtos/UpdateNoticeDto";
import { Notice } from "../../domain/entities/Notice";
import { NoticeNotFoundError } from "../../domain/errors/NoticeErrors";

export class UpdateNoticeUseCase {
  constructor(
    private readonly noticeRepository: INoticeRepository,
  ) {}

  async execute(id: number, dto: UpdateNoticeDto): Promise<Notice> {
    // 1. Check notice exists
    const notice = await this.noticeRepository.findById(id);
    if (!notice) throw new NoticeNotFoundError();

    // 2. Update fields
    if (dto.title !== undefined) notice.updateTitle(dto.title);
    if (dto.body !== undefined) notice.updateBody(dto.body);
    if (dto.category !== undefined) notice.updateCategory(dto.category);

    // 3. Save to DB
    return await this.noticeRepository.update(notice);
  }
}