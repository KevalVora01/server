import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { UserModel } from "../models/UserModel";

export class UserRepository implements IUserRepository {

  async findById(id: number): Promise<User | null> {
    const userModel = await UserModel.findByPk(id);

    if (!userModel) {
      return null;
    }

    return this.toEntity(userModel);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userModel = await UserModel.findOne({
      where: { email },
    });

    if (!userModel) {
      return null;
    }

    return this.toEntity(userModel);
  }

  async create(user: User): Promise<User> {
    const createdModel = await UserModel.create({
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    });

    return this.toEntity(createdModel);
  }

  async update(user: User): Promise<User> {
    if (!user.id) {
      throw new Error("Cannot update a user without a valid database ID.");
    }

    const [affectedCount] = await UserModel.update(
      {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        passwordHash: user.passwordHash,
      },
      {
        where: { id: user.id },
      }
    );

    if (affectedCount === 0) {
      throw new Error(`User with ID ${user.id} not found or no changes made.`);
    }

    const updatedModel = await UserModel.findByPk(user.id);
    return this.toEntity(updatedModel!);
  }

  async deactivate(id: number): Promise<void> {
    await UserModel.update(
      { isActive: false },
      { where: { id } }
    );
  }

  private toEntity(model: UserModel): User {
    return new User({
      id: model.id,
      name: model.name,
      email: model.email,
      passwordHash: model.passwordHash,
      phone: model.phone,
      role: model.role,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}