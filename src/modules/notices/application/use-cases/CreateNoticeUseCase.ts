import { INoticeRepository } from "../../domain/repositories/INoticeRepository";
import { CreateNoticeDto } from "../dtos/CreateNoticeDto";
import { Notice } from "../../domain/entities/Notice";
import { emitNewNotice } from "../../../../shared/socket/NoticeGateway";

export class CreateNoticeUseCase {
  constructor(
    private readonly noticeRepository: INoticeRepository,
  ) { }

  async execute(dto: CreateNoticeDto): Promise<Notice> {
    const notice = Notice.create({
      adminId: dto.adminId,
      title: dto.title,
      body: dto.body,
      category: dto.category,
    });

    const saved = await this.noticeRepository.create(notice);

    emitNewNotice(saved);

    return saved;
  }
}