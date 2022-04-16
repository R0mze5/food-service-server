import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Raw, Repository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import {
  FindCategoryBySlugInput,
  FindCategoryBySlugOutput,
} from './dtos/findCategoryBySlug.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/deleteRestaurant.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import {
  RestaurantByIdInput,
  RestaurantByIdOutput,
} from './dtos/restaurantById.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import {
  MyRestaurantByIdInput,
  MyRestaurantByIdOutput,
} from './dtos/my-restaurant-by-id.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
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
        restaurantId: newRestaurant.id,
      };
    } catch {
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
  }: FindCategoryBySlugInput): Promise<FindCategoryBySlugOutput> {
    try {
      const category = await this.categories.findOneOrFail(
        { slug },
        // { relations: ['restaurants'] },
      );

      const restaurants = await this.restaurants.find({
        where: { category },
        take: 25,
        skip: (page - 1) * 25,
        order: {
          isPromoted: 'DESC',
        },
      });

      // category.restaurants = restaurants;

      const totalResults = await this.countRestaurants(category);

      return {
        ok: true,
        category,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
        restaurants,
      };
    } catch {
      return { ok: false, error: "can't find category" };
    }
  }

  async restaurantById({
    restaurantId,
  }: RestaurantByIdInput): Promise<RestaurantByIdOutput> {
    try {
      const restaurant = await this.restaurants.findOneOrFail(restaurantId, {
        relations: ['category', 'menu'],
      });

      return {
        ok: true,
        restaurant,
      };
    } catch {
      return { ok: false, error: "can't find restaurant" };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    const pageSize = 1;
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        take: pageSize,
        skip: (page - 1) * pageSize,
        order: {
          isPromoted: 'DESC',
        },
        relations: ['category'],
      });

      // category.restaurants = restaurants;

      // const totalResults = await this.countRestaurants(category);

      return {
        ok: true,
        totalPages: Math.ceil(totalResults / pageSize),
        restaurants,
      };
    } catch {
      return { ok: false, error: "can't find restaurants" };
    }
  }

  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    try {
      const restaurants = await this.restaurants.find({
        owner,
      });

      // category.restaurants = restaurants;

      // const totalResults = await this.countRestaurants(category);

      return {
        ok: true,
        restaurants,
      };
    } catch {
      return { ok: false, error: "can't find restaurants" };
    }
  }

  async myRestaurantById(
    user: User,
    { id }: MyRestaurantByIdInput,
  ): Promise<MyRestaurantByIdOutput> {
    try {
      const restaurant = await this.restaurants.findOneOrFail(
        { id, owner: user },
        {
          relations: ['category', 'menu', 'orders'],
        },
      );

      return {
        ok: true,
        restaurant,
      };
    } catch {
      return { ok: false, error: "can't find restaurant" };
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

  // dish

  async createDish(
    user: User,
    { restaurantId, ...createDishInput }: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant: Restaurant = await this.restaurants.findOne(
        restaurantId,
      );

      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }

      if (restaurant.ownerId !== user.id) {
        return { ok: false, error: 'Forbidden' };
      }

      await this.dishes.save(
        this.dishes.create({
          ...createDishInput,
          restaurant,
          slug: createDishInput.name.toLowerCase().replace(/ /, '-'),
        }),
      );
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: "can't create dish",
      };
    }
  }

  async editDish(
    user: User,
    { dishId, ...editRestaurantInput }: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish: Dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'],
      });

      if (!dish) {
        return { ok: false, error: 'Dish not found' };
      }

      if (dish.restaurant.ownerId !== user.id) {
        return { ok: false, error: 'Forbidden' };
      }

      await this.dishes.save({ ...dish, ...editRestaurantInput });

      return { ok: true };
    } catch {
      return {
        ok: false,
        error: "can't delete dish",
      };
    }
  }

  async deleteDish(
    user: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish: Dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'],
      });

      if (!dish) {
        return { ok: false, error: 'Dish not found' };
      }

      if (dish.restaurant.ownerId !== user.id) {
        return { ok: false, error: 'Forbidden' };
      }

      await this.dishes.delete(dishId);

      return { ok: true };
    } catch {
      return {
        ok: false,
        error: "can't delete dish",
      };
    }
  }
}
