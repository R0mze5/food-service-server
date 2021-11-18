import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsControllers {
  constructor(private readonly restaurants: RestaurantService) {}

  @Get()
  getAll(): Promise<Array<Restaurant>> {
    return this.restaurants.getAll();
  }

  @Post('new')
  @HttpCode(HttpStatus.CREATED)
  @Header('Cache-Control', 'none')
  create(@Body() createRestaurant: CreateRestaurantDto): Promise<Restaurant> {
    return this.restaurants.createRestaurant(createRestaurant);
  }
}
