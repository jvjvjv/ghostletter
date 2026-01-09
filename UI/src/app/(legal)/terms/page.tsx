import { Container, Title, Text, Anchor } from '@mantine/core';

const Terms = () => (
  <Container size="md" py="xl">
    <Title order={1} mb="xl">Terms of Service</Title>

    <Title order={2} size="h3" mt="lg" mb="sm">1. Acceptance of Terms</Title>
    <Text mb="md">
      By accessing or using the GHOSTLETTER application (&ldquo;App&rdquo;), you agree to be bound by these Terms of
      Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, please do not use the App. GHOSTLETTER reserves
      the right to modify these Terms at any time, and such modifications shall be effective immediately upon posting.
    </Text>

    <Title order={2} size="h3" mt="lg" mb="sm">2. Prohibited Uses</Title>
    <Text mb="sm">The App shall not be used for illegal purposes under any circumstances. You agree not to use the App to:</Text>
    <ul style={{ marginBottom: '1rem' }}>
      <li>Violate any applicable local, state, national, or international law or regulation</li>
      <li>Harass, threaten, or intimidate any person</li>
      <li>Impersonate any person or entity</li>
      <li>
        Transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or
        otherwise objectionable
      </li>
      <li>Distribute malware, viruses, or any other malicious code</li>
      <li>Interfere with or disrupt the App or servers connected to the App</li>
    </ul>

    <Title order={2} size="h3" mt="lg" mb="sm">3. Content Policy</Title>
    <Text mb="md">
      You are solely responsible for all photos, messages, and other content that you upload, post, or otherwise
      transmit via the App. While content is designed to disappear after viewing, you acknowledge that recipients may
      capture or save content through screenshot or other means, despite this being contrary to the App&rsquo;s intended
      use.
    </Text>

    <Title order={2} size="h3" mt="lg" mb="sm">4. Ephemeral Nature of Content</Title>
    <Text mb="md">
      The App is designed so that photos and messages disappear after being viewed. However, GHOSTLETTER does not
      guarantee that content will be deleted in all circumstances. Users should exercise caution regarding the nature of
      content shared.
    </Text>

    <Title order={2} size="h3" mt="lg" mb="sm">5. Intellectual Property</Title>
    <Text mb="md">
      GHOSTLETTER and its licensors retain all rights, title, and interest in and to the App, including all intellectual
      property rights. You may not reproduce, modify, or prepare derivative works based upon, distribute, sell,
      transfer, publicly display, publicly perform, transmit, or otherwise use the App except as expressly permitted in
      these Terms.
    </Text>

    <Title order={2} size="h3" mt="lg" mb="sm">6. Disclaimer of Warranties</Title>
    <Text mb="md">
      THE APP IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER
      EXPRESS OR IMPLIED. GHOSTLETTER DISCLAIMS ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
      FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
    </Text>

    <Title order={2} size="h3" mt="lg" mb="sm">7. Limitation of Liability</Title>
    <Text mb="md">
      IN NO EVENT SHALL GHOSTLETTER BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
      OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
    </Text>

    <Title order={2} size="h3" mt="lg" mb="sm">8. Termination</Title>
    <Text mb="md">
      GHOSTLETTER reserves the right to terminate your access to the App at any time, for any reason, with or without
      notice.
    </Text>

    <Title order={2} size="h3" mt="lg" mb="sm">9. Governing Law</Title>
    <Text mb="md">
      These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which
      GHOSTLETTER operates, without regard to its conflict of law provisions.
    </Text>

    <Title order={2} size="h3" mt="lg" mb="sm">10. Contact</Title>
    <Text mb="md">
      If you have any questions about these Terms, please contact us at{" "}
      <Anchor href="mailto:m.jasonvertucio@gmail.com">support@ghostletter.app</Anchor>.
    </Text>
  </Container>
);

export default Terms;
