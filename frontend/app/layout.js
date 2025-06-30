import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../lib/context/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'E-Learning Platform',
  description: 'A comprehensive platform for mental health and obesity education',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}