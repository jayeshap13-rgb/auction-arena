export const pricingPlans = [
  {
    name: "Admin Managed",
    price: "Rs. 0",
    note: "First 3 teams included",
    audience: "Organizers who run bidding from the admin panel",
    highlight: true,
    features: ["Create unlimited tournaments", "3 teams free per tournament", "Rs. 99 per extra team", "Admin places bids", "Manual bid amount entry", "Projector and spectator views"],
    advantage: "Best for leagues where one auction desk controls all bids, timer, sold/unsold decisions, teams and final reports."
  },
  {
    name: "Extra Admin Teams",
    price: "Rs. 99 / team",
    note: "After the first 3 teams",
    audience: "Admin-managed leagues expanding beyond 3 teams",
    highlight: false,
    features: ["Payment checked at auction start", "One paid slot per extra team", "Purse and squad tracking", "Team logo upload", "Player photo upload", "Reports export button"],
    advantage: "Keep setup free, then pay only for the additional teams above 3 when the auction is ready to start."
  },
  {
    name: "Owner Self Bidding",
    price: "Rs. 499 / owner",
    note: "Per approved owner login",
    audience: "Tournaments where owners bid from their own dashboard",
    highlight: false,
    features: ["Owner account login", "Admin approval required", "Rs. 499 payment before approval", "Owner browser bidding", "Wishlist and bid history", "Mobile owner view"],
    advantage: "Teams can be prepared by admin, while each approved owner login is billed separately before bidding access opens."
  },
  {
    name: "Broadcast Toolkit",
    price: "Included",
    note: "With every tournament",
    audience: "Venue screens, spectators and sponsors",
    highlight: false,
    features: ["Projector display", "Spectator league pages", "Sponsor spaces", "Sold and unsold states", "Leaderboard", "Live auction detail"],
    advantage: "Keep the professional Auction Arena experience across public, owner, admin and projector views without extra display charges."
  }
];

export const demoOffer = {
  name: "Two Billing Modes",
  price: "Free to start",
  note: "Billing depends on tournament management mode.",
  features: ["Admin managed: 3 teams free", "Admin extra team: Rs. 99", "Owner self bidding: Rs. 499 per owner login", "UPI payment record", "Admin approval before owner bidding"],
  advantage: "Create a tournament first, choose admin-managed or owner self-bidding, then Auction Arena applies the correct payment rule at launch or owner approval."
};

export const planComparison = [
  ["Tournament creation", "Free", "Free", "Free", "Free"],
  ["Best use", "Admin desk bidding", "More admin teams", "Owner browser bidding", "Venue/public display"],
  ["Included free", "3 teams", "First 3 teams", "Tournament setup", "All tournaments"],
  ["Paid trigger", "Auction start", "Auction start", "Owner approval", "No extra trigger"],
  ["Price", "Rs. 99 after 3 teams", "Rs. 99/team", "Rs. 499/owner login", "Included"],
  ["Payment method", "UPI", "UPI", "UPI/payment reference", "Included"]
];

export const planAddOns = [
  ["Admin league with 3 teams", "Free", "Run a complete admin-managed auction without payment."],
  ["Admin league with 4 teams", "Rs. 99", "Only the 4th team is chargeable."],
  ["Admin league with 6 teams", "Rs. 297", "Three paid team slots after the first 3 free teams."],
  ["Owner self-bidding login", "Rs. 499", "Charged for each owner login approved to bid."]
];
