import { INoticeRepository } from "../../domain/repositories/INoticeRepository";
import { CreateNoticeDto } from "../dtos/CreateNoticeDto";
import { Notice } from "../../domain/entities/Notice";

export class CreateNoticeUseCase {
  constructor(
    private readonly noticeRepository: INoticeRepository,
  ) {}

  async execute(dto: CreateNoticeDto): Promise<Notice> {
    const notice = Notice.create({
      adminId: dto.adminId,
      title: dto.title,
      body: dto.body,
      category: dto.category,
    });

    return await this.noticeRepository.create(notice);
  }
}