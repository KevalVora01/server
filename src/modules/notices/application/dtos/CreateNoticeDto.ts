import { NoticeCategory } from "../../domain/entities/Notice";

export interface CreateNoticeDto {
  adminId: number;
  title: string;
  body: string;
  category: NoticeCategory;
}