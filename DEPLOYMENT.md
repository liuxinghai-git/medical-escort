
=== BACKEND (Render) ===
1. Create new Web Service
2. Environment: Node
3. Set env variables:
   PORT=3000
   PAYPAL_CLIENT_ID=xxx
   PAYPAL_SECRET=xxx
4. Deploy

=== FRONTEND (Cloudflare Pages) ===
1. Upload Git repo or link
2. Build command: npm run build
3. Output: .next
4. Env vars:
   NEXT_PUBLIC_API=https://your-backend.onrender.com

=== PAYPAL WEBHOOK ===
URL: https://your-backend.onrender.com/paypal/webhook
Events: CHECKOUT.ORDER.APPROVED, PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.REFUNDED
