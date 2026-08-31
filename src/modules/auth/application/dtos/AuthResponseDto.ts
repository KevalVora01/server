import { UserResponseDto } from "./UserResponseDto";

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}