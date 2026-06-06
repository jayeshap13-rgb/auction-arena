import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auction Arena",
  description: "Premium sports player auction platform prototype.",
  icons: {
    icon: "/brand/auction-arena-mark-transparent.png",
    apple: "/brand/auction-arena-mark-transparent.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('auction-arena-theme')||localStorage.getItem('bidarena-theme')||'dark';document.documentElement.classList.toggle('theme-light',t==='light');document.documentElement.classList.toggle('theme-dark',t!=='light')}catch(e){}`
          }}
        />
        {children}
      </body>
    </html>
  );
}

