import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Login | Devireen Enterprise',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
