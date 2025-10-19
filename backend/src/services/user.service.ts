import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(name: string): Promise<{ userId: string; name: string }> {
    const userId = Math.random().toString(36).substring(2, 15);

    const user = new this.userModel({
      name,
      userId,
    });

    await user.save();

    return { userId, name };
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userModel.findOne({ userId }).exec();
  }

  async createOrUpdateUser(
    userId: string,
    userName: string,
  ): Promise<{ userId: string; name: string }> {
    const existingUser = await this.userModel.findOne({ userId }).exec();

    if (existingUser) {
      // Update existing user
      existingUser.name = userName;
      await existingUser.save();
      return { userId: existingUser.userId, name: existingUser.name };
    } else {
      // Create new user
      const user = new this.userModel({
        name: userName,
        userId,
      });
      await user.save();
      return { userId: user.userId, name: user.name };
    }
  }

  async getUsersByIds(userIds: string[]): Promise<Map<string, string>> {
    const users = await this.userModel
      .find({ userId: { $in: userIds } })
      .exec();

    const userMap = new Map<string, string>();
    users.forEach((user) => {
      userMap.set(user.userId, user.name);
    });

    return userMap;
  }
}
