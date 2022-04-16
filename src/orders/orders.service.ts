import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constants';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AcceptOrderInput, AcceptOrderOutput } from './dtos/accept-order.dto';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(User)
    private readonly users: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);

      if (!restaurant) {
        return {
          ok: false,
          error: "restaurant doesn't exists",
        };
      }

      let total = 0;
      const orderItems: OrderItem[] = [];

      for (const { dishId, options } of items) {
        const dish = await this.dishes.findOne(dishId);

        if (!dish) {
          return {
            ok: false,
            error: `Dish ${dishId} doesn't exists`,
          };
        }

        let dishPrice = dish.price || 0;

        for (const { name, choice } of options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === name,
          );

          if (!dishOption) {
            return {
              ok: false,
              error: `Option ${name} doesn't exists`,
            };
          }

          dishPrice += dishOption.extra || 0;

          if (choice) {
            const dishChoice = dishOption.choices.find(
              (dishChoice) => dishChoice.name === choice,
            );

            if (!dishChoice) {
              return {
                ok: false,
                error: `Choice ${name} doesn't exists`,
              };
            }

            dishPrice += dishChoice.extra || 0;
          }
        }

        total += dishPrice;

        const orderItem = await this.orderItems.save(
          this.orderItems.create({ dish, options }),
        );

        orderItems.push(orderItem);
      }

      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant: restaurant,
          total,
          items: orderItems,
        }),
      );

      await this.pubsub.publish(NEW_PENDING_ORDER, {
        pendingOrders: { order, restaurantOwnerId: restaurant.ownerId },
      });

      return { ok: true, orderId: order.id };
    } catch {
      return {
        ok: false,
        error: "can't create order",
      };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[] = [];
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: {
            customer: user.id,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: {
            driver: user.id,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: {
            owner: user.id,
          },
          relations: ['orders'],
        });

        orders = restaurants.flatMap((restaurant) => restaurant.orders);
        if (status) {
          orders = orders.filter((order) => order.status === status);
        }
      }
      return { ok: false, orders };
    } catch {
      return { ok: false, error: "can't get orders list" };
    }
  }

  hasAccessToOrder(user: User, order: Order): boolean {
    return (
      (user.role === UserRole.Client && order.customerId === user.id) ||
      (user.role === UserRole.Delivery && order.driverId === user.id) ||
      (user.role === UserRole.Owner && order.restaurant.ownerId === user.id)
    );
  }

  async getOrder(
    user: User,
    { orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOneOrFail(orderId, {
        relations: ['restaurant'],
      });

      if (!this.hasAccessToOrder(user, order)) {
        return { ok: false, error: 'forbidden request' };
      }

      return { ok: true, order };
    } catch {
      return { ok: false, error: "can't find order" };
    }
  }

  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOneOrFail(orderId, {
        // relations: ['restaurant', 'customer', 'driver'],
        loadEagerRelations: true, // the same like prev
      });

      if (!this.hasAccessToOrder(user, order)) {
        return { ok: false, error: 'forbidden request' };
      }

      let canEdit = true;
      if (user.role === UserRole.Owner) {
        if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
          canEdit = false;
        }
      } else if (user.role === UserRole.Delivery) {
        if (
          status !== OrderStatus.PickedUp &&
          status !== OrderStatus.Delivered
        ) {
          canEdit = false;
        }
      } else if (user.role === UserRole.Client) {
        if (
          status !== OrderStatus.Cancel &&
          order.status !== OrderStatus.Pending
        ) {
          canEdit = false;
        }
      }
      if (!canEdit) {
        return { ok: false, error: 'Wrong status' };
      }

      await this.orders.save({ id: orderId, status });

      const newOrder = { ...order, status };

      if (user.role === UserRole.Owner) {
        if (status === OrderStatus.Cooked) {
          this.pubsub.publish(NEW_COOKED_ORDER, {
            cookedOrders: newOrder,
          });
        }
      }

      this.pubsub.publish(NEW_ORDER_UPDATE, {
        orderUpdates: newOrder,
      });

      return { ok: true };
    } catch {
      return { ok: false, error: "can't find order" };
    }
  }

  async acceptOrder(
    driver: User,
    { id }: AcceptOrderInput,
  ): Promise<AcceptOrderOutput> {
    try {
      const order = await this.orders.findOneOrFail(id);
      if (order.driverId) {
        return { ok: false, error: 'order already accepted' };
      }

      await this.orders.save({ id, driver });

      this.pubsub.publish(NEW_ORDER_UPDATE, {
        orderUpdates: { ...order, driver },
      });

      return { ok: true };
    } catch {
      return { ok: false, error: "can't accept order" };
    }
  }
}
