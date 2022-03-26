import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order } from '../entities/order.entity';

@InputType()
export class AcceptOrderInput extends PickType(Order, ['id']) {}

@ObjectType()
export class AcceptOrderOutput extends CoreOutput {}
