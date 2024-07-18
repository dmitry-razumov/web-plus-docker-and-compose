import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(id: number, createWishDto: CreateWishDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...restUser } = await this.userRepository.findOneBy({
      id,
    });
    return await this.wishRepository.save({
      ...createWishDto,
      owner: restUser,
    });
  }

  async findLast() {
    const wishes = await this.wishRepository.find({
      order: { createdAt: 'desc' },
      take: 40,
      relations: {
        owner: true,
      },
    });
    return wishes;
  }

  async findTop() {
    const wishes = await this.wishRepository.find({
      order: { copied: 'desc' },
      take: 20,
      relations: {
        owner: true,
      },
    });
    return wishes;
  }

  async findOne(userId: number, wishId: number) {
    const wish = await this.wishRepository.findOne({
      where: { id: wishId },
      relations: {
        owner: true,
        offers: {
          user: true,
        },
      },
    });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    if (userId !== wish.owner.id) {
      const offers = wish.offers.filter((offer) => !offer.hidden);
      wish.offers = offers;
    }
    return wish;
  }

  async update(userId: number, wishId: number, updateWishDto: UpdateWishDto) {
    const wish = await this.wishRepository.findOne({
      where: { id: wishId },
      relations: { owner: true },
    });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    if (wish.owner.id !== userId) {
      throw new BadRequestException('Чужой подарок нельзя редактировать');
    }
    if (updateWishDto.price && wish.raised > 0) {
      throw new BadRequestException(
        'Подарок нельзя редактировать, поскольку на него уже скидываются',
      );
    }
    await this.wishRepository.update(wishId, updateWishDto);
    return await this.wishRepository.findOneBy({ id: wishId });
  }

  async removeOne(userId: number, wishId: number) {
    const wish = await this.wishRepository.findOne({
      where: { id: wishId },
      relations: {
        owner: true,
        offers: {
          user: true,
        },
      },
    });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    if (wish.owner.id !== userId) {
      throw new BadRequestException('Чужой подарок нельзя удалить');
    }
    await this.wishRepository.delete(wishId);
    return wish;
  }

  async copyWish(userId: number, wishId: number) {
    const wish = await this.wishRepository.findOne({
      where: { id: wishId },
      relations: { owner: true },
    });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    if (wish.owner.id === userId) {
      throw new BadRequestException('Свой подарок нельзя скопировать к себе');
    }

    const user = await this.userRepository.findOne({
      relations: { wishes: true },
      where: { id: userId },
    });

    const isUserHasWish = user.wishes.some(
      (userWish) =>
        userWish.name === wish.name &&
        userWish.image === wish.image &&
        userWish.link === wish.link &&
        userWish.price === wish.price,
    );
    if (isUserHasWish) {
      throw new ConflictException('У Вас уже есть этот подарок');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updateWish = this.wishRepository.create(wish);
      updateWish.copied = 0;
      updateWish.raised = 0;
      updateWish.owner = user;
      const copyWish = await this.wishRepository.insert(updateWish);

      wish.copied++;
      await this.wishRepository.save(wish);

      await queryRunner.commitTransaction();
      return copyWish;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
