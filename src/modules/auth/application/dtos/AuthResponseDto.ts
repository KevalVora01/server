import { UserResponseDto } from "./UserResponseDto";

export interface AuthResponseDto {
  accessToken: string;
  user: UserResponseDto;
}