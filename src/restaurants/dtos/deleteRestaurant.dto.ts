import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/output.dto';

@ArgsType()
export class DeleteRestaurantInput {
  @Field(() => Number, { nullable: true })
  restaurantId: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends MutationOutput {}
