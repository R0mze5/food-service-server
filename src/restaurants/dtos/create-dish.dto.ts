import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/output.dto';
import { Dish } from '../entities/dish.entity';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateDishInput extends PickType(Dish, [
  'name',
  'description',
  'options',
  'price',
]) {
  @Field(() => Number)
  restaurantId: Restaurant['id'];
}

@ObjectType()
export class CreateDishOutput extends MutationOutput {}
