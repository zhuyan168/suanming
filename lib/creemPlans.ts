export type CreemPlanKey = 'monthly' | 'quarterly' | 'annual';

export interface CreemPlan {
  key: CreemPlanKey;
  name: string;
  productId: string;
  priceLabel: string;
  intervalLabel: string;
  fallbackDurationDays: number;
}

export const CREEM_PLANS: Record<CreemPlanKey, CreemPlan> = {
  monthly: {
    key: 'monthly',
    name: 'Monthly Membership',
    productId: process.env.CREEM_MONTHLY_PRODUCT_ID || 'prod_7HcpZq9noKMYl0qcWTX2ee',
    priceLabel: '$9.90',
    intervalLabel: 'month',
    fallbackDurationDays: 30,
  },
  quarterly: {
    key: 'quarterly',
    name: 'Quarterly Membership',
    productId: process.env.CREEM_QUARTERLY_PRODUCT_ID || 'prod_5BzmTr9KfyJaeYtPixler2',
    priceLabel: '$23.90',
    intervalLabel: '3 months',
    fallbackDurationDays: 90,
  },
  annual: {
    key: 'annual',
    name: 'Annual Membership',
    productId: process.env.CREEM_ANNUAL_PRODUCT_ID || 'prod_3wLy7ZPepVLoeDjyHPG9e4',
    priceLabel: '$86.90',
    intervalLabel: 'year',
    fallbackDurationDays: 365,
  },
};

export function getCreemPlan(planKey: unknown): CreemPlan | null {
  if (planKey !== 'monthly' && planKey !== 'quarterly' && planKey !== 'annual') {
    return null;
  }
  return CREEM_PLANS[planKey];
}

export function getCreemPlanByProductId(productId: unknown): CreemPlan | null {
  if (typeof productId !== 'string') return null;
  return Object.values(CREEM_PLANS).find((plan) => plan.productId === productId) || null;
}
