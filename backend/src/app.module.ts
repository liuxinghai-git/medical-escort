
import { Module } from '@nestjs/common';
import { PaypalWebhookController } from './paypal.webhook';
import { OrdersController } from './orders.controller';

@Module({
  controllers: [PaypalWebhookController, OrdersController],
})
export class AppModule {}
