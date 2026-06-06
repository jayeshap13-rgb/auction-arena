export const UPI_ID = "jayesh.ap.13@oksbi";
export const PAYEE_NAME = "Auction Arena";

export function makeUpiLink(amount: number, note: string) {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: PAYEE_NAME,
    am: String(Math.max(0, amount)),
    cu: "INR",
    tn: note
  });
  return `upi://pay?${params.toString()}`;
}

export function makeQrCodeUrl(upiLink: string, size = 220) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(upiLink)}`;
}

