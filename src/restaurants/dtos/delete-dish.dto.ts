import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteDishInput {
  @Field(() => Number, { nullable: true })
  dishId: number;
}

@ObjectType()
export class DeleteDishOutput extends MutationOutput {}
