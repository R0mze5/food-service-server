import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Restaurant {
  @Field(() => String)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => Boolean, { nullable: true })
  @Column()
  isVegan?: boolean;

  @Field(() => String, { nullable: true })
  @Column()
  address?: string;

  @Field(() => String, { nullable: true })
  @Column()
  ownerName?: string;

  @Field(() => String)
  @Column()
  categoryName: string;
}
