import { IPasswordResetTokenRepository } from "../../domain/repositories/IPasswordResetTokenRepository";
import { PasswordResetToken } from "../../domain/entities/PasswordResetToken";
import { PasswordResetTokenModel } from "../models/PasswordResetTokenModel";

export class PasswordResetTokenRepository implements IPasswordResetTokenRepository {

  private toEntity(model: PasswordResetTokenModel): PasswordResetToken {
    return new PasswordResetToken({
      id: model.id,
      userId: model.userId,
      token: model.token,
      expiresAt: model.expiresAt,
      createdAt: model.createdAt,
    });
  }

  async create(token: PasswordResetToken): Promise<PasswordResetToken> {
    const created = await PasswordResetTokenModel.create({
      userId: token.userId,
      token: token.token,
      expiresAt: token.expiresAt,
    });

    return this.toEntity(created);
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const model = await PasswordResetTokenModel.findOne({
      where: { token },
    });

    if (!model) return null;
    return this.toEntity(model);
  }

  async deleteByUserId(userId: number): Promise<void> {
    await PasswordResetTokenModel.destroy({
      where: { userId },
    });
  }

  async deleteByToken(token: string): Promise<void> {
    await PasswordResetTokenModel.destroy({
      where: { token },
    });
  }
}