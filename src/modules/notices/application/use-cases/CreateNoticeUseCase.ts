import { INoticeRepository } from "../../domain/repositories/INoticeRepository";
import { CreateNoticeDto } from "../dtos/CreateNoticeDto";
import { Notice } from "../../domain/entities/Notice";
import { INoticeNotifier } from "../../domain/services/notice-notifier.interface";

export class CreateNoticeUseCase {
  constructor(
    private readonly noticeRepository: INoticeRepository,
    private readonly notifier: INoticeNotifier
  ) { }

  async execute(dto: CreateNoticeDto): Promise<Notice> {
    const notice = Notice.create({
      adminId: dto.adminId,
      title: dto.title,
      body: dto.body,
      category: dto.category,
    });

    const saved = await this.noticeRepository.create(notice);

    await this.notifier.notifyNewNotice(saved);

    return saved;
  }
}