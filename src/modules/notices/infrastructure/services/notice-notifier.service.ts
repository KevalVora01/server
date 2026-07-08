import { INoticeNotifier } from "../../domain/services/notice-notifier.interface";
import { Notice } from "../../domain/entities/Notice";
import { getIO } from "../../../../shared/socket/socket.server";
import { Rooms } from "../../../../shared/socket/socket.rooms";
import { SOCKET_EVENTS } from "../../../../shared/socket/socket.events";

export class SocketNoticeNotifier implements INoticeNotifier {
  notifyNewNotice(notice: Notice) {
    try {
      getIO()
        .to(Rooms.role("resident"))
        .emit(SOCKET_EVENTS.NOTICE_NEW, notice.toResponseObject());
    } catch (err) {
      console.error("Failed to emit notice:new", err);
    }
  }
}