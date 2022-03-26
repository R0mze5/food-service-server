import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderController } from './orders.controller';
import { OrderResolver } from './orders.resolver';
import { OrderService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Restaurant, Dish, User, OrderItem]),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderResolver],
})
export class OrdersModule {}
