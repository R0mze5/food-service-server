import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}
  @Query(() => Boolean)
  isPizzaGood() {
    return true;
  }

  @Query(() => Restaurant)
  myRestaurant() {
    return {
      name: 12311,
    };
  }

  // @Query(() => [Restaurant])
  // restaurants(@Args('vegan') vegan?: boolean): Promise<Restaurant[]> {
  //   console.log(vegan);
  //   return this.restaurantService.getAll();
  // }

  @Query(() => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

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

  @Mutation(() => Restaurant)
  async createRestaurant(
    @Args('input') createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    try {
      return await this.restaurantService.createRestaurant(createRestaurantDto);
    } catch (error) {
      console.log(error);
    }
  }

  @Mutation(() => Restaurant)
  async updateRestaurant(
    @Args() updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    try {
      return await this.restaurantService.updateRestaurant(updateRestaurantDto);
    } catch (error) {
      console.log(error);
    }
  }
}
