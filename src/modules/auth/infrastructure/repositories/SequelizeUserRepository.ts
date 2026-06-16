import {
  IUserRepository,
  CreateUserData,
} from "../../domain/repositories/IUserRepository";

import {
  User,
  UserRole,
} from "../../domain/entities/User";

import { UserModel } from "../models/UserModel";

export class SequelizeUserRepository implements IUserRepository {
  
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

  async create(data: CreateUserData): Promise<User> {
    const createdModel = await UserModel.create({
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      phone: data.phone,
      role: data.role as UserRole,
    });

    return this.toEntity(createdModel);
  }

  async update(user: User): Promise<User> {
    // Look up the record first to make sure we update the specific instance
    const userModel = await UserModel.findByPk(user.id);
    
    if (!userModel) {
      throw new Error(`User with ID ${user.id} not found for updates.`);
    }

    // Assign domain changes to the database model
    userModel.name = user.name;
    userModel.email = user.email;
    userModel.phone = user.phone;
    userModel.role = user.role;
    userModel.isActive = user.isActive;

    // Save changes back to PostgreSQL
    await userModel.save();

    return this.toEntity(userModel);
  }

  async deactivate(id: number): Promise<void> {
    // Optimized single-step update to set is_active to false
    await UserModel.update(
      { isActive: false },
      { where: { id } }
    );
  }

  // Maps the Sequelize Model instance data into our pure Domain Entity
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