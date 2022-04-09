import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';
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
import { EditDishOutput, EditDishInput } from './dtos/edit-dish.dto';
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
import { RestaurantService } from './restaurants.service';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  // @Mutation(() => Restaurant)
  // createRestaurant(
  //   @Args('name') name: string,
  //   @Args('isVegan') isVegan?: boolean,
  //   @Args('address') address?: string,
  //   @Args('ownerName') ownerName?: string,
  // ): Restaurant {
  //   console.log({ name, isVegan });

  //   return { name, isVegan };
  // }

  // @Mutation(() => Boolean)
  // createRestaurant(@Args() createRestaurantDto: CreateRestaurantDto): boolean {
  //   console.log(createRestaurantDto);

  //   return true;
  // }

  // @UseGuards(AuthGuard)
  @Mutation(() => CreateRestaurantOutput)
  @Role([UserRole.Owner])
  createRestaurant(
    @AuthUser() user: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(user, createRestaurantInput);
  }

  @Mutation(() => EditRestaurantOutput)
  @Role([UserRole.Owner])
  editRestaurant(
    @AuthUser() user: User,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(user, editRestaurantInput);
  }

  @Mutation(() => DeleteRestaurantOutput)
  @Role([UserRole.Owner])
  deleteRestaurant(
    @AuthUser() user: User,
    @Args() deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(user, deleteRestaurantInput);
  }

  @Query(() => RestaurantsOutput)
  restaurants(
    @Args('input') restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.allRestaurants(restaurantsInput);
  }

  @Query(() => MyRestaurantsOutput)
  @Role(['Owner'])
  myRestaurants(@AuthUser() user: User) {
    return this.restaurantService.myRestaurants(user);
  }

  @Query(() => RestaurantByIdOutput)
  restaurantById(
    @Args('input') restaurantInput: RestaurantByIdInput,
  ): Promise<RestaurantByIdOutput> {
    return this.restaurantService.restaurantById(restaurantInput);
  }

  @Query(() => SearchRestaurantOutput)
  searchRestaurant(
    @Args('input') restaurantInput: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    return this.restaurantService.searchRestaurant(restaurantInput);
  }
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField(() => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurants(category);
  }

  @Query(() => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories();
  }

  @Query(() => FindCategoryBySlugOutput)
  findCategoryBySlug(
    @Args('input') categoryInput: FindCategoryBySlugInput,
  ): Promise<FindCategoryBySlugOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }
}

@Resolver(() => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => CreateDishOutput)
  @Role(['Owner'])
  createDish(
    @Args('input') createDishInput: CreateDishInput,
    @AuthUser() user: User,
  ): Promise<CreateDishOutput> {
    return this.restaurantService.createDish(user, createDishInput);
  }

  @Mutation(() => EditDishOutput)
  @Role(['Owner'])
  editDish(
    @Args('input') editDishInput: EditDishInput,
    @AuthUser() user: User,
  ): Promise<EditDishOutput> {
    return this.restaurantService.editDish(user, editDishInput);
  }

  @Mutation(() => DeleteDishOutput)
  @Role(['Owner'])
  deleteDish(
    @Args('input') deleteDishInput: DeleteDishInput,
    @AuthUser() user: User,
  ): Promise<DeleteDishOutput> {
    return this.restaurantService.deleteDish(user, deleteDishInput);
  }
}
