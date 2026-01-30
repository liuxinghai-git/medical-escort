
import { Controller, Post, Req } from '@nestjs/common';

@Controller('paypal')
export class PaypalWebhookController {
  @Post('webhook')
  async webhook(@Req() req: any) {
    console.log('PayPal Webhook Received:', req.body.event_type);
    return { received: true };
  }
}
