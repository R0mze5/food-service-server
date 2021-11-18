import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';

// @ArgsType()
// export class CreateRestaurantDto {
//   @Field(() => String)
//   @IsString()
//   @Length(5, 30)
//   name: string;

//   @Field(() => Boolean, { nullable: true })
//   @IsBoolean()
//   isVegan?: boolean;

//   @Field(() => String, { nullable: true })
//   @IsString()
//   address?: string;

//   @Field(() => String, { nullable: true })
//   @IsString()
//   ownerName?: string;

//   @Field(() => String, { nullable: true })
//   @IsString()
//   categoryName: string;
// }
@InputType()
export class CreateRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  // InputType,// we can use InputType here or Abstract InputType in service
) {}
