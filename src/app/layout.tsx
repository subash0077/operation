import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "gklacademy | Claim Your Free Professional Course 🎓",
    description: "Join gklacademy for free access to Pharma, Full Stack, AI, Engineering, Commerce & CA courses. Limited time offer! Claim now and share with friends! 🔥✨",
    openGraph: {
        title: "gklacademy | Free Professional Courses 🎓",
        description: "Enroll for free in premium courses at gklacademy! 🚀",
        images: [{ url: '/og-image.jpg' }],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
