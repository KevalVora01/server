import { NoticeCategory } from "../../domain/entities/Notice";

export interface UpdateNoticeDto {
  title?: string;
  body?: string;
  category?: NoticeCategory;
}