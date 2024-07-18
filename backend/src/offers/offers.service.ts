import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, createOfferDto: CreateOfferDto) {
    const { itemId, amount } = createOfferDto;
    const wish = await this.wishRepository.findOne({
      relations: {
        owner: true,
      },
      where: {
        id: itemId,
      },
    });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    if (wish.owner.id === userId) {
      throw new BadRequestException('Нельзя скинуться на свой подарок');
    }
    const newRaised = Number(wish.raised) + Number(amount);
    if (newRaised > wish.price) {
      throw new BadRequestException('Сумма с учетом заявки превысит требуемую');
    }

    const user = await this.userRepository.findOneBy({ id: userId });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const offer = await this.offerRepository.save({
        ...createOfferDto,
        user,
        item: wish,
      });
      await this.wishRepository.update(wish.id, { raised: newRaised });
      return offer;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.offerRepository.find({
      relations: {
        user: true,
        item: true,
      },
    });
  }

  async findOne(id: number) {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: {
        user: true,
        item: true,
      },
    });
    if (!offer) {
      throw new NotFoundException('Offer не найден');
    }
    return offer;
  }
}
