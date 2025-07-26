// services/billingService.ts
//  Mock data for available billing plans;
export const billingPlans = [
  { id: 'plan_basic', name: 'Basic', price: 10, currency: 'USD' },
  { id: 'plan_pro', name: 'Pro', price: 25, currency: 'USD' },
];
//  This interface defines the shape of the object we will return;
interface SubscriptionData { plan: string,;
  status: string,;
  renewalDate: Date,;
  externalId: string,
/* ` *`