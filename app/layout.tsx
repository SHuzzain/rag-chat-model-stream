import { Geist, Geist_Mono, IBM_Plex_Sans } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { after } from "next/server";
import db from "@/connector/db.drizzle";
import { TooltipProvider } from "@/components/ui/tooltip";

const ibmPlexSans = IBM_Plex_Sans({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  after(async () => {
    try {
      const result = await db.execute("SELECT 1")
      if (result.count === 1) {
        console.log("Drizzle is initialized and connected to the database.")
      } else {
        throw new Error("Drizzle is not properly initialized or connected to the database.")
      }
    }
    catch (error) {
      console.error("Error initializing Drizzle:", error)
    }
  })
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", ibmPlexSans.variable)}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
