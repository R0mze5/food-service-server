import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Dish, DishOption } from '../entities/dish.entity';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateDishInput extends PickType(Dish, [
  'name',
  'description',
  'price',
  'photo',
]) {
  @Field(() => Number)
  restaurantId: Restaurant['id'];

  @Field(() => [DishOption], { nullable: true })
  options?: DishOption[];
}

@ObjectType()
export class CreateDishOutput extends CoreOutput {}
