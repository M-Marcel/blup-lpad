export type PaymentMethodId = "stripe" | "nowpayments";

export type PaymentMethod = {
  id: PaymentMethodId;
  name: string;
  subtitle: string;
  options: string[];
  mode: "test" | "sandbox";
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "stripe",
    name: "Stripe",
    subtitle: "Card and Buy Now Pay Later",
    options: ["Visa", "Mastercard", "Amex", "Affirm", "Klarna"],
    mode: "test",
  },
  {
    id: "nowpayments",
    name: "NOWPayments",
    subtitle: "Crypto checkout with IPN webhook",
    options: ["USDC", "USDT", "ETH", "BTC"],
    mode: "sandbox",
  },
];
