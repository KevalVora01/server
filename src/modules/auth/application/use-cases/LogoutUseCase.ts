import { IRefreshTokenRepository } from "../../domain/repositories/IRefreshTokenRepository";

export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository
  ) {}

  async execute(refreshToken: string): Promise<void> {
    // Graceful early exit: If there's no token, there's nothing to delete
    if (!refreshToken) {
      return;
    }

    // Invalidate the session by purging the token from the database
    await this.refreshTokenRepository.deleteByToken(refreshToken);
  }
}