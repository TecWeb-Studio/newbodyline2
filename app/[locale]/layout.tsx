import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../i18n/routing';
import { BookingProvider } from '../contexts/BookingContext';
import { I18nProvider } from '../contexts/I18nContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages();
  
  return {
    title: (messages.metadata as { title: string }).title,
    description: (messages.metadata as { description: string }).description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-[#fafafa]`}
      >
        <NextIntlClientProvider messages={messages}>
          <BookingProvider>
            <I18nProvider>
              {children}
              <LanguageSwitcher />
            </I18nProvider>
          </BookingProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}