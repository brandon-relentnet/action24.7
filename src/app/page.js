"use client";
import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";
import { submitPayment } from "./actions/actions";
import ENV_VARS from '@/lib/env';

export default function Home() {
  const { SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID, SQUARE_ENVIRONMENT } = ENV_VARS;

  console.log("Square App ID:", SQUARE_APPLICATION_ID);
  console.log("Square Location ID:", SQUARE_LOCATION_ID);
  console.log("Square Environment:", SQUARE_ENVIRONMENT);

  return (
    <PaymentForm
      applicationId={SQUARE_APPLICATION_ID}
      locationId={SQUARE_LOCATION_ID}
      cardTokenizeResponseReceived={async (token) => {
        const result = await submitPayment(token.token);
        console.log(result);
      }}
    >
      <CreditCard />
    </PaymentForm>
  );
}
