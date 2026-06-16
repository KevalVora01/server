import { IRefreshTokenRepository } from "../../domain/repositories/IRefreshTokenRepository";

export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository
  ) {}

  async execute(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    await this.refreshTokenRepository.deleteByToken(
      refreshToken
    );
  }
}