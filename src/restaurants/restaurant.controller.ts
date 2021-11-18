import { Controller, Get } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsControllers {
  constructor(private readonly restaurants: RestaurantService) {}

  @Get()
  // @Redirect('/', 301)
  getAll(): Promise<Array<Restaurant>> {
    return this.restaurants.getAll();
  }
}
