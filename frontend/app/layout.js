import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../lib/context/auth-context';
import { LanguageProvider } from '../lib/context/LanguageContext';
import ClientWrapper from '../components/ClientWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HEAL Student - Platform Kesehatan Holistik',
  description: 'Platform kursus online gratis berbasis psikologi untuk kesehatan holistik',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider>
            <ClientWrapper>
              {children}
            </ClientWrapper>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}