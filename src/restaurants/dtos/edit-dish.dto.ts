import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Dish } from '../entities/dish.entity';

@InputType()
export class EditDishInput extends PartialType(
  PickType(Dish, ['name', 'description', 'price', 'photo', 'options']),
) {
  @Field(() => Number)
  dishId: Dish['id'];
}

@ObjectType()
export class EditDishOutput extends CoreOutput {}
