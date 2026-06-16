import { Controller, Get } from '@nestjs/common';
import { POPULAR_ROUTES } from './popular-routes.data';

@Controller('travel')
export class TravelController {
  @Get('popular')
  getPopularRoutes() {
    return { routes: POPULAR_ROUTES };
  }
}
