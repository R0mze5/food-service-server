import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/output.dto';
import { Dish } from '../entities/dish.entity';
import { CreateDishInput } from './create-dish.dto';

@InputType()
export class EditDishInput extends PartialType(CreateDishInput) {
  @Field(() => Number)
  dishId: Dish['id'];
}

@ObjectType()
export class EditDishOutput extends MutationOutput {}
