import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

@Resolver(() => Restaurant)
export class RestaurantResolver {
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

  @Query(() => [Restaurant])
  restaurants(@Args('vegan') vegan?: boolean): Restaurant[] {
    console.log(vegan);
    return [];
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

  @Mutation(() => Boolean)
  createRestaurant(@Args() createRestaurantDto: CreateRestaurantDto): boolean {
    console.log(createRestaurantDto);

    return true;
  }
}
