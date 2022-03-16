import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from './output.dto';

@InputType()
export class PaginationInput {
  @Field(() => Number, { defaultValue: 1 })
  page: number;
}

@ObjectType()
export class PaginationOutput extends MutationOutput {
  @Field(() => Number, { nullable: true })
  totalPages?: number;
}
