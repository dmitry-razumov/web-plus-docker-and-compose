import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userId: number, createWishlistDto: CreateWishlistDto) {
    const { itemsId, ...restWishlist } = createWishlistDto;
    const items = await this.wishRepository.find({
      where: { id: In(itemsId) },
    });
    const owner = await this.userRepository.findOneBy({ id: userId });
    const wishlist = await this.wishlistRepository.save({
      items,
      owner,
      ...restWishlist,
    });
    return wishlist;
  }

  async findAll() {
    return await this.wishlistRepository.find({
      relations: {
        owner: true,
        items: true,
      },
    });
  }

  async findOne(id: number) {
    const wishlist = await this.wishlistRepository.findOne({
      relations: {
        owner: true,
        items: true,
      },
      where: { id },
    });
    if (!wishlist) {
      throw new NotFoundException('Wishlist не найден');
    }
    return wishlist;
  }

  async update(
    id: number,
    userId: number,
    updateWishlistDto: UpdateWishlistDto,
  ) {
    const wishlist = await this.wishlistRepository.findOneBy({ id });
    if (!wishlist) {
      throw new NotFoundException('Whishlist не найден');
    }
    if (wishlist.owner.id !== userId) {
      throw new BadRequestException(
        'Wishlist редактировать может только owner',
      );
    }
    const { itemsId, ...restWishlist } = updateWishlistDto;
    const items = await this.wishRepository.find({
      where: { id: In(itemsId) },
    });
    await this.wishlistRepository.save({
      ...wishlist,
      ...restWishlist,
      items,
    });
    return this.wishlistRepository.findOneBy({ id });
  }

  async removeOne(id: number, userId: number) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        items: true,
      },
    });
    if (!wishlist) {
      throw new NotFoundException('Whishlist не найден');
    }
    if (wishlist.owner.id !== userId) {
      throw new BadRequestException('Wishlist может удалить только owner');
    }
    await this.wishlistRepository.delete(id);
    return wishlist;
  }
}
