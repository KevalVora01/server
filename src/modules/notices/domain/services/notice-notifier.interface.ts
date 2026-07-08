import { Notice } from "../entities/Notice";

export interface INoticeNotifier {
  notifyNewNotice(notice: Notice): void;
}