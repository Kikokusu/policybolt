export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SYkfHsSv10Hu2o',
    priceId: 'price_1RddANKSNriwT6N669BShQb0',
    name: 'Solo Developer Plan',
    description: 'Perfect for indie makers and solo founders. Includes 1 project with GitHub integration, auto-updating privacy policies, limited compliance coverage, and email support.',
    mode: 'subscription',
  },
  {
    id: 'prod_SYkgXpjArucCAm',
    priceId: 'price_1RddB1KSNriwT6N6Ku1vE00V',
    name: 'Growing Startup',
    description: 'Built for fast-moving teams. Manage up to 5 projects with auto-updating privacy policies, global compliance coverage, team collaboration tools, GitHub integration, and priority support.',
    mode: 'subscription',
  },
];