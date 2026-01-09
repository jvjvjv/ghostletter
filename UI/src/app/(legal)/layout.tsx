import { Divider, Anchor, Container } from '@mantine/core';

import "../globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Container size="md">
        <Divider mt="xl" />
        <Anchor href="/sign-in" mt="sm" display="block">
          Back to Sign In
        </Anchor>
      </Container>
    </>
  );
}
