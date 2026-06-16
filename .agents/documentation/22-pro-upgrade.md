# Component Documentation: ProUpgradeModal

## 1. Component Name and Path
- **Component Name**: `ProUpgradeModal`
- **File Path**: `components/forecast/ProUpgradeModal.tsx`

## 2. Simulated Data/Actions
This component simulates a subscription upgrade purchase flow (unlocking advanced GPA forecasting features) by using nested timeouts to simulate payment processor checkout sessions and loading screens.

### Simulated Data/Actions Code Snippets
The mock checkout session simulator (Lines 17–28):
```tsx
const handleCheckout = () => {
  setIsLoading(true);
  // Dummy Stripe simulation
  setTimeout(() => {
    setIsLoading(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  }, 1500);
};
```

## 3. Database/API Migration Plan

### Step 1: Database Model Extension
Add subscription tier properties inside the `User` model in `schema.prisma`:
```prisma
model User {
  // ... other fields
  isPro            Boolean   @default(false) @map("is_pro")
  stripeCustomerId String?   @map("stripe_customer_id")
  stripeSessionId  String?   @map("stripe_session_id")
}
```

### Step 2: Stripe Checkout API Session
Create a backend checkout handler `/api/payment/checkout` using the official Stripe Node.js SDK:
```typescript
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function POST(req: Request) {
  const { userId } = await req.json();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [{
      price: process.env.STRIPE_PRO_PRICE_ID, // Configured in Stripe Dashboard
      quantity: 1,
    }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/forecast?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/forecast?payment=cancelled`,
    metadata: { userId },
  });

  return NextResponse.json({ url: session.url });
}
```

### Step 3: Payment Hook Webhook
Implement a secure Stripe Webhook endpoint `/api/webhooks/stripe` that listens for `invoice.paid` or `checkout.session.completed` events:
1. Verify the Stripe webhook signature headers.
2. Read the `userId` metadata parameter.
3. Update user subscription status in the database:
   ```typescript
   await prisma.user.update({
     where: { id: userId },
     data: { isPro: true, stripeCustomerId: customerId }
   });
   ```

### Step 4: UI Payment Trigger
Update `ProUpgradeModal.tsx` to call `/api/payment/checkout` and redirect the window directly to the checkout link. Let Stripe handle the security and card processing.
