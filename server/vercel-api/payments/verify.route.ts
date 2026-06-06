import crypto from "node:crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type VerifyPaymentBody = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: "Payment verification is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as VerifyPaymentBody | null;
  const orderId = body?.razorpay_order_id || "";
  const paymentId = body?.razorpay_payment_id || "";
  const signature = body?.razorpay_signature || "";

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Order id, payment id, and signature are required." }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);
  const verified = expectedBuffer.length === signatureBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

  if (!verified) {
    return NextResponse.json({ verified: false, error: "Payment signature mismatch." }, { status: 400 });
  }

  return NextResponse.json({
    verified: true,
    orderId,
    paymentId
  });
}
