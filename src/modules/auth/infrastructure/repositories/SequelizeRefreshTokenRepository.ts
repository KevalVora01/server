import { Op } from "sequelize";
import {
  IRefreshTokenRepository,
  CreateRefreshTokenData,
} from "../../domain/repositories/IRefreshTokenRepository";

import { RefreshToken } from "../../domain/entities/RefreshToken";
import { RefreshTokenModel } from "../models/RefreshTokenModel";

export class SequelizeRefreshTokenRepository implements IRefreshTokenRepository {
  
  async create(data: CreateRefreshTokenData): Promise<RefreshToken> {
    const createdModel = await RefreshTokenModel.create({
      userId: data.userId,
      token: data.token,
      expiresAt: data.expiresAt,
    });

    return this.toEntity(createdModel);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const tokenModel = await RefreshTokenModel.findOne({
      where: { token },
    });

    if (!tokenModel) {
      return null;
    }

    return this.toEntity(tokenModel);
  }

  async deleteByToken(token: string): Promise<void> {
    await RefreshTokenModel.destroy({
      where: { token },
    });
  }

  async deleteAllByUserId(userId: number): Promise<void> {
    await RefreshTokenModel.destroy({
      where: { userId },
    });
  }

  async deleteExpiredTokens(): Promise<void> {
    await RefreshTokenModel.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date(), // Generates: WHERE expires_at < NOW()
        },
      },
    });
  }

  // Safely map Sequelize model attributes to Domain Entity properties
  private toEntity(model: RefreshTokenModel): RefreshToken {
    return new RefreshToken({
      id: model.id,
      userId: model.userId,
      token: model.token,
      expiresAt: model.expiresAt,
      createdAt: model.createdAt,
    });
  }
}