import React, { useState, useCallback, lazy, Suspense } from 'react';
import { Select, Card, Text, Page, Button, Icon, BlockStack, InlineGrid, Divider } from '@shopify/polaris';
import { HomeFilledIcon } from '@shopify/polaris-icons';
import { useNavigate } from "@remix-run/react";

// Lazy load the components
const BulkCustomerJSX = lazy(() => import("./app.customerBulk"));
const BulkOrderJSX = lazy(() => import("./app.orderBulk"));

function SelectExample() {
  const [selected, setSelected] = useState('order');

  // Callback to handle select change
  const handleSelectChange = useCallback(
    (value) => setSelected(value),
    []
  );

  const navigate = useNavigate();

  const options = [
    { label: 'Order', value: 'order' },
    { label: 'Customer', value: 'customer' },
  ];

  const selectContainerStyle = {
    maxWidth: '300px',
    maxHeight: '50px',
    margin: '0px 0px 0px 25px',
  };

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'flex-end', 
    padding: '2px', 
   
  };



  return (
    <Page>
      <div style={buttonContainerStyle}   onClick={() => {
                    navigate("/app/registerPage");
                }}>
        <Button icon={HomeFilledIcon}>Back to Dashboard</Button>
      </div><br/>
      <Divider />
      <Card roundedAbove="sm">
        <BlockStack gap="200">
          <InlineGrid columns="1fr auto">
            <div style={{ flex: 1 }}>
              <div style={selectContainerStyle}>
                <Select
                  label="Campaign type"
                  options={options}
                  onChange={handleSelectChange}
                  value={selected}
                />
              </div>

              <Suspense fallback={<div></div>}>
                {selected === 'customer' && <BulkCustomerJSX />}
                {selected === 'order' && <BulkOrderJSX />}
              </Suspense>
            </div>
          </InlineGrid>
        </BlockStack>
      </Card>
    </Page>
  );
}

export default SelectExample;
