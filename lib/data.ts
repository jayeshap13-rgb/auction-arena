export type Team = {
  id: string;
  name: string;
  owner: string;
  purse: number;
  spent: number;
  color: string;
  squad: number;
  leagueIds?: string[];
  logo?: string;
  registrationStatus?: "Pending" | "Approved" | "Rejected";
};

export type Player = {
  id: string;
  name: string;
  role: string;
  category: string;
  basePrice: number;
  rating: string;
  status: "Under Auction" | "Sold" | "Unsold" | "Queued";
  photo: string;
  stats: string;
  soldTo?: string;
  soldPrice?: number;
  wishlist?: boolean;
  leagueId?: string;
  approvalStatus?: "Pending" | "Approved" | "Rejected";
  submittedBy?: string;
};

export const teams: Team[] = [
  { id: "t1", name: "Mumbai Meteors", owner: "Aarav Shah", purse: 1200, spent: 470, color: "#E50914", squad: 8 },
  { id: "t2", name: "Chennai Titans", owner: "Meera Iyer", purse: 1200, spent: 390, color: "#F5B301", squad: 7 },
  { id: "t3", name: "Delhi Voltage", owner: "Kabir Khan", purse: 1200, spent: 560, color: "#FF1E1E", squad: 9 },
  { id: "t4", name: "Bengal Blazers", owner: "Riya Sen", purse: 1200, spent: 430, color: "#C91F37", squad: 8 },
  { id: "t5", name: "Punjab Strikers", owner: "Armaan Gill", purse: 1200, spent: 310, color: "#DD2222", squad: 6 },
  { id: "t6", name: "Hyderabad Hawks", owner: "Zara Ali", purse: 1200, spent: 610, color: "#A80F18", squad: 10 },
  { id: "t7", name: "Jaipur Royals", owner: "Dev Rathore", purse: 1200, spent: 270, color: "#B91C1C", squad: 5 },
  { id: "t8", name: "Kochi Mariners", owner: "Nikhil Menon", purse: 1200, spent: 520, color: "#EF4444", squad: 9 }
];

const names = [
  "Arjun Rao", "Dev Malik", "Vihaan Das", "Nikhil Verma", "Kabir Sethi", "Ayaan Kapoor", "Rohan Batra", "Ishaan Gill",
  "Yash Nair", "Reyansh Bose", "Samar Joshi", "Akhil Reddy", "Farhan Mir", "Kunal Rana", "Rudra Singh", "Omkar Patil",
  "Rahul Menon", "Vivaan Mehta", "Aditya Jain", "Mahir Khan", "Pranav Suri", "Dhruv Arora", "Tanish Roy", "Harsh Vyas",
  "Neil Thomas", "Kartik Shah", "Aryan Bedi", "Sahil Naqvi", "Milan Dutta", "Rishi Kulkarni", "Tejas Iyer", "Laksh Sood",
  "Parth Desai", "Manav Saxena", "Abeer Qureshi", "Eshan Paul", "Raghav Puri", "Jay Shetty", "Viraj Anand", "Anik Sen"
];

const roles = ["Opening Batter", "Power Hitter", "Fast Bowler", "Spin Bowler", "All-rounder", "Wicket Keeper"];
const categories = ["Marquee", "A", "B", "Emerging"];

export const players: Player[] = names.map((name, index) => ({
  id: `p${index + 1}`,
  name,
  role: roles[index % roles.length],
  category: categories[index % categories.length],
  basePrice: [30, 50, 75, 100, 150, 200][index % 6],
  rating: ["9.4", "8.8", "8.6", "8.2", "7.9"][index % 5],
  status: index === 0 ? "Under Auction" : index < 8 ? "Sold" : index < 11 ? "Unsold" : "Queued",
  photo: name.split(" ").map((part) => part[0]).join(""),
  stats: `${280 + index * 17} runs / ${8 + (index % 18)} wickets / SR ${124 + (index % 52)}`
}));

export const bidHistory = [
  { team: "Delhi Voltage", player: "Arjun Rao", amount: 240, time: "08:14 PM" },
  { team: "Mumbai Meteors", player: "Arjun Rao", amount: 230, time: "08:13 PM" },
  { team: "Chennai Titans", player: "Arjun Rao", amount: 220, time: "08:12 PM" },
  { team: "Bengal Blazers", player: "Arjun Rao", amount: 210, time: "08:11 PM" }
];

export const sponsors = ["TITLE SPONSOR", "POWERED BY", "STREAM PARTNER"];
