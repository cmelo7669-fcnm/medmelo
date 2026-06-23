import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MedMel - Gerenciamento de Estudos',
  description: 'Plataforma completa para preparação de residência médica',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 dark:bg-gray-900">{children}</body>
    </html>
  );
}
