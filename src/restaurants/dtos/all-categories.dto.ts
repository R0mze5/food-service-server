import { Field, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/output.dto';
import { Category } from '../entities/category.entity';

@ObjectType()
export class AllCategoriesOutput extends MutationOutput {
  @Field(() => [Category])
  categories?: Category[];
}
