// services/flutterwave.service.ts
import axios from "axios";

const FLW_BASE_URL = "https://api.flutterwave.com/v3";
const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY!;

const flwClient = axios.create({
  baseURL: FLW_BASE_URL,
  headers: {
    Authorization: `Bearer ${FLW_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

interface InitiateEscrowParams {
  amount: number; // plain number — convert Decimal.toNumber() before calling
  currency: string;
  email: string;
  txRef: string; // your own unique reference, stored as paymentRef
  redirectUrl: string;
  narration: string;
}

interface InitiateTransferParams {
  amount: number;
  currency: string;
  accountBank: string; // Flutterwave bank code, not the raw name
  accountNumber: string;
  narration: string;
  reference: string;
}

export const initiateTransfer = async (params: InitiateTransferParams) => {
  const response = await flwClient.post("/transfers", {
    account_bank: params.accountBank,
    account_number: params.accountNumber,
    amount: params.amount,
    currency: params.currency,
    narration: params.narration,
    reference: params.reference,
  });
  return response.data.data as { id: number; status: string };
};

// Resolves an account number to the account holder's name — worth calling
// when an agency adds/edits a bank account, to catch typos before payout day.
export const resolveAccountName = async (accountBank: string, accountNumber: string) => {
  const response = await flwClient.post("/accounts/resolve", {
    account_bank: accountBank,
    account_number: accountNumber,
  });
  return response.data.data as { account_name: string };
};
/**
 * Initiates a payment flagged for escrow hold. Returns a Flutterwave
 * checkout link the frontend redirects the payer to.
 *
 * NOTE: this uses the metadata-flag escrow pattern documented on
 * Flutterwave's v2 docs (rave_escrow_tx). If Flutterwave confirms this is
 * deprecated on v3, only this function needs to change — swap to
 * subaccounts + manual settlement instead. Controllers calling this
 * function don't need to know which underlying mechanism is used.
 */
export const initiateEscrowPayment = async (params: InitiateEscrowParams) => {
  const response = await flwClient.post("/payments", {
    tx_ref: params.txRef,
    amount: params.amount,
    currency: params.currency,
    redirect_url: params.redirectUrl,
    customer: { email: params.email },
    customizations: { title: "Escrow Payment", description: params.narration },
    meta: {
      rave_escrow_tx: 1,
    },
  });

  return {
    checkoutUrl: response.data.data.link as string,
  };
};

/**
 * Verifies a transaction by its Flutterwave transaction ID — called from
 * the webhook handler to confirm a payment actually succeeded before
 * trusting the webhook payload (never trust the webhook body alone).
 */
export const verifyTransaction = async (flwTransactionId: string) => {
  const response = await flwClient.get(`/transactions/${flwTransactionId}/verify`);
  return response.data.data as {
    status: string; // "successful" | "failed" | ...
    tx_ref: string;
    amount: number;
    currency: string;
    id: number;
  };
};

/**
 * Releases funds held in escrow to the merchant's settlement account.
 */
export const releaseEscrowFunds = async (flwTransactionId: string) => {
  const response = await flwClient.post(`/transactions/${flwTransactionId}/escrow/settle`);
  return response.data;
};

/**
 * Refunds a transaction back to the payer. Used both for disputes
 * resolved in the payer's favor and for cancelled requests.
 */
export const refundTransaction = async (flwTransactionId: string, amount?: number) => {
  const response = await flwClient.post(`/transactions/${flwTransactionId}/refund`, {
    ...(amount && { amount }),
  });
  return response.data;
};