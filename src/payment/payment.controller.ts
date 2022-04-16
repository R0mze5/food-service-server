import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payments.service';

@Controller('/payments')
export class PaymentController {
  constructor(private readonly payments: PaymentService) {}

  @Post('/paddle')
  processPaddlePayment(@Body() body) {
    console.log(body);
  }
}
