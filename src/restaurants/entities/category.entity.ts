import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from './restaurant.entity';
import { Dish } from './dish.entity';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  @Length(3, 30)
  name: string;

  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  @Length(3, 30)
  slug: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  image: string;

  @Field(() => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant) => restaurant.category)
  restaurants: Restaurant[];
}
