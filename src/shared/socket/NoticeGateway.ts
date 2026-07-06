import { getIO } from "./SocketServer";
import { Notice } from "../../modules/notices/domain/entities/Notice";

export const emitNewNotice = (notice: Notice): void => {
  const io = getIO();
  // sab connected clients ko emit karo
  io.emit("notice:new", notice.toResponseObject());
};

export const emitNoticeUpdated = (notice: Notice): void => {
  const io = getIO();
  io.emit("notice:updated", notice.toResponseObject());
};

export const emitNoticeDeleted = (id: number): void => {
  const io = getIO();
  io.emit("notice:deleted", { id });
};