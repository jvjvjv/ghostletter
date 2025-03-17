import React from "react";

export const Privacy = () => {
  return (
    <main className="page">
      <h1>Privacy Policy</h1>

      <div className="highlight">
        <p>
          <strong>Summary:</strong> For this demo version of GHOSTLETTER, no user data will leave
          your device. All information, including photos, messages, and account details, is stored
          locally on your device.
        </p>
      </div>

      <h2>1. Data Collection</h2>
      <p>
        For this demo version of GHOSTLETTER, no user data will leave your device. All information,
        including photos, messages, and account details, is stored locally on your device and is not
        transmitted to any external servers or third parties.
      </p>

      <h2>2. Device Permissions</h2>
      <p>GHOSTLETTER requires certain permissions to function properly:</p>
      <ul>
        <li>Camera access: Required to capture photos</li>
        <li>Storage access: Required to save photos temporarily on your device</li>
        <li>
          Network access: Only for basic app functionality (not used to transmit user data in this
          demo)
        </li>
      </ul>
      <p>
        You may revoke these permissions at any time through your device settings, but doing so may
        impact the functionality of the App.
      </p>

      <h2>3. Data Storage</h2>
      <p>
        All content, including photos and messages, is stored locally on your device. Photos are
        designed to be accessible for only 60 seconds after viewing, after which they become
        inaccessible.
      </p>

      <h2>4. User Control</h2>
      <p>
        You have full control over your data in this demo app. Since data is stored locally,
        uninstalling the App will remove all associated data from your device.
      </p>

      <h2>5. Security</h2>
      <p>
        While we implement reasonable security measures to protect your data stored locally on your
        device, please be aware that no method of electronic storage is 100% secure. We cannot
        guarantee absolute security of your data.
      </p>

      <h2>6. Children&rsquo;s Privacy</h2>
      <p>
        GHOSTLETTER is not intended for use by individuals under the age of 13. We do not knowingly
        collect personal information from children under 13. If you are a parent or guardian and
        believe your child has provided personal information to us, please contact us.
      </p>

      <h2>7. Changes to This Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you of any changes by
        posting the new Privacy Policy on this page.
      </p>

      <h2>8. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us at
        privacy@ghostletter.app.
      </p>

      <h2>9. Data Retention</h2>
      <p>
        In this demo version, data is retained only for as long as the app is installed on your
        device. Message and photo data is designed to become inaccessible after viewing as specified
        in the app&rsquo;s functionality.
      </p>

      <h2>10. Third Parties</h2>
      <p>
        This demo app does not share information with third parties. All data remains on your
        device.
      </p>
    </main>
  );
};

export default Privacy;
