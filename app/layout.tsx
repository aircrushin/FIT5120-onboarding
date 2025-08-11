import "./globals.css";

import { GeistSans } from "geist/font/sans";
import Header from "./components/header";
import Footer from "./components/footer";

let title = "Cosmetic Safety Platform | build with ❤ 5120-TM1";
let description =
  "Helping young adults in Malaysia make informed cosmetic choices by checking product safety, understanding risks, and receiving alerts about banned or harmful products.";

export const metadata = {
  title,
  description,
  keywords: [
    "cosmetic safety",
    "Malaysia",
    "health protection",
    "beauty safety",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.difyChatbotConfig = {
                token: 'oTLdj5rm3xfgIBNl',
                systemVariables: {
                 // user_id: 'user_skintelli',
                 // conversation_id: 'conversation_skintelli',
                },
                userVariables: {
                  avatar_url: 'https://avatar.iran.liara.run/public/95'
                  // name: 'user_skintelli',
                },
              }
            `,
          }}
        />
        <script
          src="https://udify.app/embed.min.js"
          id="oTLdj5rm3xfgIBNl"
          defer
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #dify-chatbot-bubble-button {
                background: linear-gradient(135deg, #ec4899 0%, #9333ea 100%) !important;
                color: white !important;
                border: none !important;
                transition: all 0.3s ease !important;
                position: fixed !important;
                z-index: 9999 !important;
              }
              #dify-chatbot-bubble-button:hover {
                background: linear-gradient(135deg, #db2777 0%, #7c3aed 100%) !important;
                transform: scale(1.05) !important;
                box-shadow: 0 6px 20px rgba(147, 51, 234, 0.4) !important;
              }
              #dify-chatbot-bubble-button,
              #dify-chatbot-bubble-window {
                position: fixed !important;
                z-index: 9999 !important;
              }
            `,
          }}
        />
      </head>
      <body className={GeistSans.variable}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
