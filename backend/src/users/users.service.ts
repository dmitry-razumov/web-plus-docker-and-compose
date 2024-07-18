import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { HashService } from 'src/hash/hash.service';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email } = createUserDto;
    const exists = await this.userRepository.exists({
      where: [{ username }, { email }],
    });
    if (exists) {
      throw new ConflictException(
        'Пользователь с таким email или username уже зарегистрирован',
      );
    }
    const user = this.userRepository.create({
      username: createUserDto.username,
      about: createUserDto.about,
      avatar: createUserDto.avatar,
      email: createUserDto.email,
      password: this.hashService.getHash(createUserDto.password),
    });
    return await this.userRepository.save(user);
  }

  async findOne(query: FindOneOptions<User>): Promise<User> {
    const user = await this.userRepository.findOne(query);
    if (!user) {
      throw new NotFoundException('User не найден');
    }
    return user;
  }

  async findOneById(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User не найден');
    }
    return user;
  }

  async updateById(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { email, username, password } = updateUserDto;
    const user = await this.findOne({ where: { id } });
    if (email) {
      const userWithEmail = await this.userRepository.findOne({
        where: { email },
      });
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException('Такой email уже используется');
      }
    }
    if (username) {
      const userWithUsername = await this.userRepository.findOne({
        where: { username },
      });
      if (userWithUsername && userWithUsername.id !== id) {
        throw new ConflictException('Такое имя пользователя уже используется');
      }
    }
    if (password) {
      const pass = this.hashService.getHash(password);
      updateUserDto.password = pass;
    }
    const updateUser = { ...user, ...updateUserDto };
    await this.userRepository.update({ id }, updateUser);
    return this.userRepository.findOneBy({ id });
  }

  async findWishes(id: number): Promise<Wish[]> {
    const wishes = await this.userRepository.find({
      select: ['wishes'],
      relations: {
        wishes: {
          owner: true,
          offers: {
            user: {
              wishes: true,
              offers: true,
              wishlists: {
                owner: true,
                items: true,
              },
            },
          },
        },
      },
      where: { id: id },
    });

    const wishesArr = wishes.map((item) => item.wishes);
    return wishesArr[0];
  }

  async findOneByUsername(username: string) {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundException('User не найден');
    }
    return user;
  }

  async findMany(query: string): Promise<User[]> {
    return await this.userRepository.find({
      where: [{ username: query }, { email: query }],
    });
  }
}
