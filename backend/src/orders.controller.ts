
import { Controller, Get, Post, Body } from '@nestjs/common';

let orders: any[] = [];

@Controller('orders')
export class OrdersController {
  @Post()
  create(@Body() body: any) {
    const order = {
      id: Date.now(),
      email: body.email,
      service: body.service,
      status: 'PENDING'
    };
    orders.push(order);
    return order;
  }

  @Get()
  list() {
    return orders;
  }
}
