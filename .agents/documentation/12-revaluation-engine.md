# Component Documentation: RevaluationEngineWidget

## 1. Component Name and Path
- **Component Name**: `RevaluationEngineWidget`
- **File Path**: `components/backlog/RevaluationEngineWidget.tsx`

## 2. Simulated Data/Actions
This component simulates the revaluation registration process for backlog papers, including a mock processing delay and transaction status mockup for payment gateway fees.

### Simulated Data/Actions Code Snippets
The mock payment handler (Lines 34–40):
```tsx
const handlePay = () => {
  setProcessing(true);
  setTimeout(() => {
    setProcessing(false);
    setPaymentDone(true);
  }, 2000);
};
```

## 3. Database/API Migration Plan

### Step 1: Real Payment Gateway Setup
Create a Stripe or Razorpay integration to process actual revaluation fees:
1. When the user clicks the "Pay & Apply" button, the frontend calls a backend endpoint `/api/backlog/revaluation/checkout` with the `courseId` and `userId`.
2. The endpoint creates a Stripe Checkout Session:
   ```typescript
   const session = await stripe.checkout.sessions.create({
     payment_method_types: ['card'],
     line_items: [{
       price_data: {
         currency: 'inr',
         product_data: { name: `Revaluation Registration: ${courseCode}` },
         unit_amount: 50000, // INR 500.00
       },
       quantity: 1,
     }],
     mode: 'payment',
     success_url: `${process.env.NEXT_PUBLIC_APP_URL}/backlog?session_id={CHECKOUT_SESSION_ID}`,
     cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/backlog`,
   });
   return NextResponse.json({ url: session.url });
   ```
3. Redirect the user to the returned Stripe Checkout URL.

### Step 2: Webhook and Database Sync
Set up a secure webhook endpoint `/api/webhooks/payment` that handles the `checkout.session.completed` event:
1. Parse metadata (e.g. `userId`, `courseId`).
2. Insert a record in the `BacklogApplication` / `RevaluationRequest` table.
3. Update the `BacklogRecord` status to `"REGISTERED"` (or a custom enum value indicating that revaluation is underway).
   ```typescript
   await prisma.backlogRecord.update({
     where: { userId_courseId: { userId, courseId } },
     data: { status: "REGISTERED" }
   });
   ```

### Step 3: UI Implementation
Replace the local `setTimeout` timer in `RevaluationEngineWidget.tsx` with a redirect function pointing the browser to the generated payment checkout URL.
