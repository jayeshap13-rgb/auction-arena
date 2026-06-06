import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type CreateOrderBody = {
  amount: number;
  purpose: "admin_extra_team" | "owner_login";
  leagueId?: string;
  ownerRequestId?: string;
};

function razorpayAuth() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return {
    keyId,
    header: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`
  };
}

export async function POST(request: Request) {
  const auth = razorpayAuth();
  if (!auth) {
    return NextResponse.json({ error: "Payment gateway is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as CreateOrderBody | null;
  const amount = Math.round(Number(body?.amount || 0));
  if (!body || !amount || amount < 1) {
    return NextResponse.json({ error: "Valid amount is required." }, { status: 400 });
  }

  const receipt = `${body.purpose}-${Date.now()}`.slice(0, 40);
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Authorization": auth.header,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: amount * 100,
      currency: "INR",
      receipt,
      notes: {
        purpose: body.purpose,
        leagueId: body.leagueId || "",
        ownerRequestId: body.ownerRequestId || ""
      }
    })
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return NextResponse.json({ error: data?.error?.description || "Could not create payment order." }, { status: response.status });
  }

  return NextResponse.json({
    keyId: auth.keyId,
    order: data
  });
}
