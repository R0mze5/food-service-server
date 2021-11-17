import { ArgsType, Field } from '@nestjs/graphql';
import { IsString, IsBoolean, Length } from 'class-validator';

@ArgsType()
export class CreateRestaurantDto {
  @Field(() => String)
  @IsString()
  @Length(5, 10)
  name: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  isVegan?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  ownerName?: string;
}
