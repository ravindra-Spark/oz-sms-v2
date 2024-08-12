import React, { useState, useEffect, lazy, Suspense } from 'react';
import { LegacyCard } from '@shopify/polaris';

const TestJSX = lazy(() => import("./app.bulkselector"));
const SSSJSX = lazy(() => import("./app.settingPage"));
const DASJSX = lazy(() => import("./app.registerPage"));
// const AbandonedOrderJSX = lazy(() => import("./app.abandoned"));

function TabsWithCustomDisclosureExample() {
  const [hidetab, setHidetab] = useState({
    senderID: '',
    clientID: '',
    apiKey: '',
  });

  useEffect(() => {
    async function fetchSettings() {
      const response = await fetch('https://shopifyv1.ozonesender.com/api/settings');
      if (response.ok) {
        const data = await response.json();
        setHidetab(data);
      }
    }
    fetchSettings();
  }, []);

  const clientID = hidetab.clientID;
  const apiKey = hidetab.apiKey;
  const senderID = hidetab.senderID;
  const showConfigDetails = clientID && apiKey && senderID;

  return (
    <LegacyCard>
      {showConfigDetails ? (
        <LegacyCard.Section title="Dashboard">
          <Suspense fallback={<div></div>}>
            <DASJSX />
          </Suspense>
        </LegacyCard.Section>
      ) : (
        <LegacyCard.Section title="OzoneSender">
          <Suspense fallback={<div></div>}>
            <SSSJSX />
          </Suspense>
        </LegacyCard.Section>
      )}
    </LegacyCard>
  );
}

export default TabsWithCustomDisclosureExample;
