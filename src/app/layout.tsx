import "./globals.css";
import AppHeaderServer from "../components/AppHeaderServer";
import { Inter } from "next/font/google";

const inter = Inter({
subsets: ["latin"],
display: "swap",
variable: "--font-sans"
});

export const metadata = { title: "The A.B.L.E. Man" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en" className={inter.variable}>
<body>
<AppHeaderServer />
<main className="container">{children}</main>
</body>
</html>
);
}