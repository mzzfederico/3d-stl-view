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
}
