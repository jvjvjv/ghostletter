import { Container, Title, Text } from '@mantine/core';

const Privacy = () => (
  <Container size="md" py="xl">
    <Title order={1} mb="xl">Privacy Policy</Title>

    <div style={{ padding: '1rem', backgroundColor: 'var(--mantine-color-blue-0)', borderRadius: '8px', marginBottom: '1.5rem' }}>
      <Text fw={600} mb="xs">Summary:</Text>
      <Text>
        For this demo version of GHOSTLETTER, no user data will leave your device. All
        information, including photos, messages, and account details, is stored locally on your device.
      </Text>
    </div>

    <Title order={2} size="h3" mt="lg" mb="sm">1. Data Collection</Title>
    <Text mb="md">
      For this demo version of GHOSTLETTER, no user data will leave your device. All information, including photos,
      messages, and account details, is stored locally on your device and is not transmitted to any external servers or
      third parties.
    </Text>

    <Title order={2} size="h3" mt="lg" mb="sm">2. Device Permissions</Title>
    <Text mb="sm">GHOSTLETTER requires certain permissions to function properly:</Text>
    <ul style={{ marginBottom: '1rem' }}>
      <li>Camera access: Required to capture photos</li>
      <li>Storage access: Required to save photos temporarily on your device</li>
      <li>Network access: Only for basic app functionality (not used to transmit user data in this demo)</li>
    </ul>
    <Text mb="md">
      You may revoke these permissions at any time through your device settings, but doing so may impact the
      functionality of the App.
    </Text>

    <Title order={2} size="h3" mt="lg" mb="sm">3. Data Storage</Title>
    <Text mb="md">
      All content, including photos and messages, is stored locally on your device. Photos are designed to be accessible
      for only 60 seconds after viewing, after which they become inaccessible.
    </Text>

    <Title order={2} size="h3" mt="lg" mb="sm">4. User Control</Title>
    <Text mb="md">
      You have full control over your data in this demo app. Since data is stored locally, uninstalling the App will
      remove all associated data from your device.
    </Text>

    <Title order={2} size="h3" mt="lg" mb="sm">5. Security</Title>
    <Text mb="md">
      While we implement reasonable security measures to protect your data stored locally on your device, please be
      aware that no method of electronic storage is 100% secure. We cannot guarantee absolute security of your data.
    </Text>

    <Title order={2} size="h3" mt="lg" mb="sm">6. Children&rsquo;s Privacy</Title>
    <Text mb="md">
      GHOSTLETTER is not intended for use by individuals under the age of 13. We do not knowingly collect personal
      information from children under 13. If you are a parent or guardian and believe your child has provided personal
      information to us, please contact us.
    </Text>

    <Title order={2} size="h3" mt="lg" mb="sm">7. Changes to This Policy</Title>
    <Text mb="md">
      We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy
      Policy on this page.
    </Text>

    <Title order={2} size="h3" mt="lg" mb="sm">8. Contact Us</Title>
    <Text mb="md">If you have any questions about this Privacy Policy, please contact us at privacy@ghostletter.app.</Text>

    <Title order={2} size="h3" mt="lg" mb="sm">9. Data Retention</Title>
    <Text mb="md">
      In this demo version, data is retained only for as long as the app is installed on your device. Message and photo
      data is designed to become inaccessible after viewing as specified in the app&rsquo;s functionality.
    </Text>

    <Title order={2} size="h3" mt="lg" mb="sm">10. Third Parties</Title>
    <Text mb="md">This demo app does not share information with third parties. All data remains on your device.</Text>
  </Container>
);

export default Privacy;
