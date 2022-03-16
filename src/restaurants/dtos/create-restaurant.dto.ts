import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/output.dto';
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
// @InputType()
// export class CreateRestaurantDto extends OmitType(
//   Restaurant,
//   ['id'],
//   // InputType,// we can use InputType here or Abstract InputType in service
// ) {}
@InputType()
export class CreateRestaurantInput extends PickType(
  Restaurant,
  ['address', 'coverImage', 'name'],
  // InputType,// we can use InputType here or Abstract InputType in service
) {
  @Field(() => String)
  categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends MutationOutput {}
