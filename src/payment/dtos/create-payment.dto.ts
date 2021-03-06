import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Payment } from '../entities/payment.entity';

@InputType()
export class CreatePaymentInput extends PickType(Payment, ['transactionId']) {
  @Field(() => Int)
  restaurantId: Restaurant['id'];
}

@ObjectType()
export class CreatePaymentOutput extends CoreOutput {}
