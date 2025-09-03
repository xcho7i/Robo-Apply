# Card Decline Testing Guide

## Overview
This guide explains how to test card decline scenarios during plan upgrades using Stripe's test card numbers and the new API endpoints.

## New API Endpoints

### 1. Get User Payment Methods
**Endpoint:** `GET /api/subscription/payment-methods`

**Purpose:** Retrieve all payment methods associated with the user's Stripe customer account.

**Response:**
```json
{
  "success": true,
  "paymentMethods": [
    {
      "id": "pm_1234567890",
      "last4": "4242",
      "brand": "visa",
      "expMonth": 12,
      "expYear": 2030,
      "isDefault": true
    }
  ]
}
```

### 2. Update Payment Method for Testing
**Endpoint:** `POST /api/subscription/update-payment-method-test`

**Purpose:** Update the user's default payment method with a Stripe test card to simulate various decline scenarios.

**Request Body:**
```json
{
  "testCardType": "insufficient_funds"
}
```

**Available Test Card Types:**
- `insufficient_funds` - Simulates insufficient funds error
- `expired` - Simulates expired card error  
- `incorrect_cvc` - Simulates incorrect CVC error

**Response:**
```json
{
  "success": true,
  "msg": "Payment method updated with test card for insufficient_funds simulation",
  "paymentMethodId": "pm_1234567890",
  "testCardType": "insufficient_funds"
}
```

## Stripe Test Card Numbers

### Insufficient Funds
- **Card Number:** `4000000000000002`
- **Error:** `card_declined` with reason `insufficient_funds`
- **Use Case:** Simulates when a card is declined due to insufficient balance

### Expired Card
- **Card Number:** `4000000000000069`
- **Error:** `expired_card`
- **Use Case:** Simulates when a card has expired

### Incorrect CVC
- **Card Number:** `4000000000000127`
- **Error:** `incorrect_cvc`
- **Use Case:** Simulates when the CVC code is incorrect

## Testing Workflow

### Step 1: Check Current Payment Methods
```bash
curl -X GET "http://localhost:3000/api/subscription/payment-methods" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 2: Update Payment Method with Test Card
```bash
curl -X POST "http://localhost:3000/api/subscription/update-payment-method-test" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "testCardType": "insufficient_funds"
  }'
```

### Step 3: Attempt Plan Upgrade
```bash
curl -X POST "http://localhost:3000/api/subscription/upgrade" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "identifier": "standard_monthly_individual"
  }'
```

## Expected Error Responses

### Insufficient Funds Error
```json
{
  "success": false,
  "msg": "Failed to change plan.",
  "error": "Your card was declined.",
  "stripeError": {
    "type": "card_error",
    "code": "card_declined",
    "decline_code": "insufficient_funds"
  }
}
```

### Expired Card Error
```json
{
  "success": false,
  "msg": "Failed to change plan.",
  "error": "Your card has expired.",
  "stripeError": {
    "type": "card_error",
    "code": "expired_card"
  }
}
```

### Incorrect CVC Error
```json
{
  "success": false,
  "msg": "Failed to change plan.",
  "error": "Your card's security code is incorrect.",
  "stripeError": {
    "type": "card_error",
    "code": "incorrect_cvc"
  }
}
```

## Testing Scenarios

### Scenario 1: Trial User Upgrade with Insufficient Funds
1. Ensure user is on a trial plan (e.g., `basic_monthly_individual`)
2. Update payment method with insufficient funds test card
3. Attempt upgrade to `standard_monthly_individual`
4. Verify trial continues unchanged and error is returned

### Scenario 2: Trial User Upgrade with Expired Card
1. Ensure user is on a trial plan
2. Update payment method with expired card test card
3. Attempt upgrade to any paid plan
4. Verify trial continues unchanged and appropriate error response

### Scenario 3: Trial User Upgrade with Incorrect CVC
1. Ensure user is on a trial plan
2. Update payment method with incorrect CVC test card
3. Attempt upgrade to any paid plan
4. Verify trial continues unchanged and CVC error response

## Important Notes

1. **Trial Cancellation:** When a trial user attempts to upgrade, the trial is only cancelled if the payment succeeds. If the payment fails (e.g., card declined), the trial continues unchanged and the plan change is reverted.

2. **Database State:** The subscription record in the database will only reflect the trial cancellation and plan change if the payment succeeds. Failed payments will revert the plan change.

3. **Stripe Webhooks:** Failed payments will trigger `invoice.payment_failed` webhook events, which are logged in the application.

4. **Error Handling:** The application properly handles and returns Stripe error messages to the client. Failed trial upgrades will revert the plan change automatically.

5. **Test Environment:** These test cards only work in Stripe's test mode. They will not work in production.

## Troubleshooting

### Common Issues

1. **"User not found or Stripe customer not available"**
   - Ensure the user has a valid Stripe customer ID
   - Check if the user has completed the initial subscription setup

2. **"Failed to update payment method"**
   - Verify the Stripe API key is correct
   - Check if the user has proper permissions

3. **Test cards not working**
   - Ensure you're using Stripe test mode
   - Verify the card numbers are entered correctly
   - Check that the expiration date is in the future

### Debug Steps

1. Check the application logs for detailed error messages
2. Verify the Stripe dashboard for webhook events
3. Confirm the user's subscription status in the database
4. Test with different card types to isolate issues

## Security Considerations

1. **Test Cards Only:** These test card numbers should never be used in production
2. **Environment Separation:** Ensure test and production environments are properly separated
3. **Error Logging:** Be careful not to log sensitive payment information
4. **Access Control:** These testing endpoints should be restricted in production

## Related Documentation

- [Stripe Test Cards Documentation](https://stripe.com/docs/testing#cards)
- [Stripe Error Codes](https://stripe.com/docs/error-codes)
- [Subscription Management API Documentation](./SUBSCRIPTION_API.md)
- [Webhook Handling Guide](./WEBHOOK_GUIDE.md)
