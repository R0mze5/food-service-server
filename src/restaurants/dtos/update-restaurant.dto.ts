import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateRestaurantDto } from './create-restaurant.dto';

@InputType()
class UpdateRestaurantInputType extends PartialType(CreateRestaurantDto) {}

@ArgsType()
export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {
  @Field(() => Number)
  id;

  @Field(() => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}
