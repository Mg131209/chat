import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async addOne(user: CreateUserDto) {
    if (
      await this.userRepository.findOne({
        where: { username: user.username },
      })
    ) {
      throw new HttpException('username is already taken', HttpStatus.CONFLICT);
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword: string = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    return this.userRepository.insert(user);
  }

  async getOne(id: User['id']) {
    const data = await this.userRepository.findOne({ where: { id } });
    return data;
  }
  async getAll() {
    return this.userRepository.find();
  }
}
