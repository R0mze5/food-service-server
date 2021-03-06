import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Category } from '../entities/category.entity';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class FindCategoryBySlugInput extends PaginationInput {
  @Field(() => String)
  slug: string;
}

@ObjectType()
export class FindCategoryBySlugOutput extends PaginationOutput {
  @Field(() => Category, { nullable: true })
  category?: Category;

  @Field(() => [Restaurant])
  restaurants?: Restaurant[];
}
