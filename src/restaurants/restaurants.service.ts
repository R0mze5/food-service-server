import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ILike, Raw, Repository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/deleteRestaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository,
  ) {}

  async createRestaurant(
    user: User,
    {
      categoryName: userCategoryName,
      ...createRestaurantInput
    }: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create({
        ...createRestaurantInput,
        owner: user,
      });

      newRestaurant.category = await this.categories.getOrCreate(
        userCategoryName,
      );

      await this.restaurants.save(newRestaurant);

      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: "can't create restaurant",
      };
    }
  }

  async editRestaurant(
    user: User,
    { restaurantId, categoryName, ...editRestaurantInput }: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        { id: restaurantId },
        // { loadRelationIds: true },
      );

      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }

      if (restaurant.ownerId !== user.id) {
        return { ok: false, error: 'Forbidden' };
      }

      if (categoryName) {
        restaurant.category = await this.categories.getOrCreate(categoryName);
      }

      await this.restaurants.save([{ ...restaurant, ...editRestaurantInput }]);

      return { ok: true };
    } catch {
      return { ok: false, error: "can't update restaurant" };
    }
  }

  async deleteRestaurant(
    user: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({ id: restaurantId });

      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }

      if (restaurant.ownerId !== user.id) {
        return { ok: false, error: 'Forbidden' };
      }

      const a = await this.restaurants.delete(restaurantId);
      console.log(a);

      return { ok: true };
    } catch {
      return { ok: false, error: "can't delete restaurant" };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return { ok: true, categories };
    } catch {
      return { ok: false, error: "can't find categories" };
    }
  }

  countRestaurants(category: Category): Promise<number> {
    return this.restaurants.count({ category });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOneOrFail(
        { slug },
        // { relations: ['restaurants'] },
      );

      const restaurants = await this.restaurants.find({
        where: { category },
        take: 25,
        skip: (page - 1) * 25,
      });

      // category.restaurants = restaurants;

      const totalResults = await this.countRestaurants(category);

      return {
        ok: true,
        category,
        totalPages: Math.ceil(totalResults / 25),
        restaurants,
      };
    } catch {
      return { ok: false, error: "can't find category" };
    }
  }

  async restaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOneOrFail(restaurantId);

      return {
        ok: true,
        restaurant,
      };
    } catch {
      return { ok: false, error: "can't find restaurant" };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        take: 25,
        skip: (page - 1) * 25,
      });

      // category.restaurants = restaurants;

      // const totalResults = await this.countRestaurants(category);

      return {
        ok: true,
        totalPages: Math.ceil(totalResults / 25),
        restaurants,
      };
    } catch {
      return { ok: false, error: "can't find restaurants" };
    }
  }

  async searchRestaurant({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          // name: ILike(`%${query}%`),
          name: Raw((name) => `${name} ILIKE '%${query}%'`),
        },
        take: 25,
        skip: (page - 1) * 25,
      });

      return {
        ok: true,
        totalPages: Math.ceil(totalResults / 25),
        restaurants,
      };
    } catch {
      return { ok: false, error: "can't find restaurant" };
    }
  }
}
