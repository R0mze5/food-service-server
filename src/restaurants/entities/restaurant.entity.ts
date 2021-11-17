import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Restaurant {
  @Field(() => String)
  name: string;

  @Field(() => Boolean, { nullable: true })
  isVegan?: boolean;

  @Field(() => String, { nullable: true })
  address: string;

  @Field(() => String, { nullable: true })
  ownerName: string;
}
