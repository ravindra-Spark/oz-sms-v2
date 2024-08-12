import React, { useState, useEffect  } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { Card, Page, BlockStack, Divider, useBreakpoints, Grid, TextField, Select,Text,LegacyCard, TextContainer, Banner, Link} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import Swal from 'sweetalert2';






const sendMessage = async (clientID, campaignName, apiKey, senderID, message, recipientContacts, setLoading, setSuccessCount, setUnsuccessCount, setUnsuccessDetails) => {
  setLoading(true);
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };


  try {
    const sendResponse = await fetch(`https://api.ozonesender.com/v1/bulk/?user_id=${encodeURIComponent(clientID)}&campaign_name=${encodeURIComponent(campaignName)}&api_key=${encodeURIComponent(apiKey)}&sender_id=${encodeURIComponent(senderID)}&message=${encodeURIComponent(message)}&recipient_contacts=${encodeURIComponent(recipientContacts)}`, requestOptions);

    if (sendResponse.ok) {
      const sendData = await sendResponse.json();
      if (sendData.status_code === 204) {
        Swal.fire('Success', 'Message sent successfully', 'success');
      } else {
        const success = sendData.success ? sendData.success.flat().length : 0;
        const unsuccess = sendData.unsuccess ? sendData.unsuccess.flat().length : 0;
        const unsuccessDetails = sendData.unsuccess ? sendData.unsuccess.flat() : [];

        setSuccessCount(success);
        setUnsuccessCount(unsuccess);
        setUnsuccessDetails(unsuccessDetails);

        Swal.fire('Success', 'Message sent successfully', 'success');
      }
     
      
    } else {
      Swal.fire('Error', 'Failed to send message. HTTP status: ' + sendResponse.status, 'error');
    }
  } catch (error) {
    //Swal.fire('Error', 'Error sending message: ' + error.message, 'error');
    Swal.fire('Error', 'Error sending message: App Settings Configuration Required', 'error');
  } finally {
    setLoading(false);
  }
};

export default function OrderPage() {
  const { smUp } = useBreakpoints();
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [noNumbersMessage, setNoNumbersMessage] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [totalPhoneNumberCount, setTotalPhoneNumberCount] = useState(0);
  const [duplicatePhoneNumberCount, setDuplicatePhoneNumberCount] = useState(0);
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState({
    senderID: '',
    clientID: '',
    apiKey: '',
  });
  const [loadingSendMessage, setLoadingSendMessage] = useState(false);
  const [loadingFilterOrders, setLoadingFilterOrders] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [unsuccessCount, setUnsuccessCount] = useState(0);
  const [unsuccessDetails, setUnsuccessDetails] = useState([]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('https://shopifyv1.ozonesender.com/api/settings');
        if (response.ok) {
          const data = await response.json();
          setFormState(data);
        } else {
          throw new Error('Failed to fetch settings');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }finally {
        setSettingsLoading(false);
    }
    }
    fetchSettings();
  }, []);

  const campaignName = `shopify sms bulk ${formState.senderID}`;

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const handleFilterOrders = async () => {
    setLoadingFilterOrders(true);
    setNoNumbersMessage("");
    const startDate = dateRange[0].startDate.toISOString().split('T')[0];
    const endDate = dateRange[0].endDate.toISOString().split('T')[0];
    
    try {
      const response = await fetchOrders(startDate, endDate);
      const phoneNumbers = response.orders.flatMap(order => 
        order.billingAddress ? formatPhoneNumber(order.billingAddress.phone) : []
      );
      const totalPhoneNumberCount = phoneNumbers.length;
      const uniquePhoneNumbers = Array.from(new Set(phoneNumbers));
      const duplicatePhoneNumberCount = totalPhoneNumberCount - uniquePhoneNumbers.length;

      if (uniquePhoneNumbers.length === 0) {
        setNoNumbersMessage("Mobile number is not mentioned for the selected date range.");
      }

      setPhoneNumbers(uniquePhoneNumbers);
      setTotalPhoneNumberCount(totalPhoneNumberCount);
      setDuplicatePhoneNumberCount(duplicatePhoneNumberCount);
    } catch (error) {
      console.error("Error filtering orders:", error);
    } finally {
      setLoadingFilterOrders(false);
    }
  };

  const fetchOrders = async (startDate, endDate) => {
    try {
      const response = await fetch(`/api/orderBulk?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  };

  const formatPhoneNumber = (phoneNumber) => {
    return phoneNumber.replace(/^\+/, '');
  };

  const handlePhoneNumbersChange = (event) => {
    const input = event.target.value;
    const numbers = input.split(/,|\n/).map(number => number.trim());
    setPhoneNumbers(numbers);
  };

  const handleSendMessage = async () => {
    setLoadingSendMessage(true);
    
    try {
      // Call the sendMessage function and wait for it to complete
      await sendMessage(
        formState.clientID,
        campaignName,
        formState.apiKey,
        formState.senderID,
        message,
        phoneNumbers.join(','),
        setLoadingSendMessage,
        setSuccessCount,
        setUnsuccessCount,
        setUnsuccessDetails
      );
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      // Clear the message field after response comes in
      setMessage("");
      setLoadingSendMessage(false);
    }
  };
  



  return (
    <Page>
      {/* <TitleBar title="oZoneSender" /> */}
      <BlockStack gap={{ xs: "800", sm: "400" }}>
        <Card roundedAbove="md">
          <BlockStack gap="400">
            <Grid columns={{ sm: 2 }}>
              <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 4, xl: 6 }}>


                <div >
                  <h1>Select Date Range</h1>
                  <DateRangePicker
                    ranges={dateRange}
                    onChange={handleSelect}
                  />
                </div>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 4, xl: 6 }}>
                <h1 style={{margin: '20px 0px 0px 150px', fontSize: '18px'}}>Send bulk SMS according to orders.</h1>
                <p style={{margin: '20px 0px 0px 150px'}}>Here you can send bulk SMS campaigns to your customers' phones.</p>
                <p style={{margin: '20px 0px 0px 150px'}}>Orders can be filtered based on the date they were created.</p>
                <button
                  style={{
                    padding: '10px 15px',
                    display: 'block',
                    margin: '20px 0px 0px 150px',
                    cursor: loadingFilterOrders ? 'not-allowed' : 'pointer',
                    backgroundColor: loadingFilterOrders ? '#3BB1FE' : '#3d91ff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    textDecoration: 'none'
                  }}
                  onClick={handleFilterOrders}
                  disabled={loadingFilterOrders}
                >
                  {loadingFilterOrders ? 'Filtering...' : 'Filter'}
                </button>
              </Grid.Cell>
            </Grid>
            {noNumbersMessage && (
            // <div style={{ marginTop: '20px', color: 'red', background:'red'}}>
            //   <p>{noNumbersMessage}</p>
            // </div>
            <Banner tone="critical"><p>There are no mobile numbers within the specified timeframe..</p></Banner>
          )}

            {phoneNumbers.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <p>Total Phone Numbers: {totalPhoneNumberCount}</p>
              <p>Duplicate Phone Numbers: {duplicatePhoneNumberCount}</p>
            </div>)}

            {phoneNumbers.length > 0 && (
            <div style={{marginBottom: '-4%'}}>
            <p>Enter Message</p>
            </div>  )}


            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            
              {phoneNumbers.length > 0 && (
                
                <>
               
                  <textarea
                    placeholder="Enter Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{
                      width: '100%',
                      height: '100px',
                      marginTop: '20px',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '4px',
                      borderColor: '#d9d9d9',
                      outline: 'none', 
                      transition: 'border-color 0.3s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#3d91ff')}
                    onBlur={(e) => (e.target.style.borderColor = '#d9d9d9')}
                  />
                  {/* <textarea
                    value={phoneNumbers.join(',')}
                    onChange={handlePhoneNumbersChange}
                    style={{
                      width: '100%',
                      height: '200px',
                      marginTop: '20px',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '4px',
                      borderColor: '#d9d9d9',
                      outline: 'none', 
                      transition: 'border-color 0.3s ease',
                    }}
                    //disabled={true}
                    onFocus={(e) => (e.target.style.borderColor = '#3d91ff')}
                    onBlur={(e) => (e.target.style.borderColor = '#d9d9d9')}
                  /> */}
                  {message.trim().length > 0 && (
                    <button
                      style={{
                        padding: '10px 20px',
                        marginTop: '20px',
                        backgroundColor: loadingSendMessage ? '#cccccc' : '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loadingSendMessage ? 'not-allowed' : 'pointer',
                        alignSelf: 'flex-end'
                      }}
                      onClick={handleSendMessage}
                      disabled={loadingSendMessage}
                    >
                      {loadingSendMessage ? 'Sending...' : 'Send Message'}
                    </button>
                  )}
                </>
              )}
            </div>
            {(successCount > 0 || unsuccessCount > 0) && (
              <>
              {smUp && <Divider />}
              <div style={{ marginTop: '20px' }}>
                <p>Success Message Count: {successCount}</p>
                <p>Unsuccess Message Count: {unsuccessCount}</p>
                {unsuccessDetails.length > 0 && (
                  <ul>
                    {unsuccessDetails.map((detail, index) => (
                      <li key={index}>Number: {detail.number}, Status: {detail.status}</li>
                    ))}
                  </ul>
                )}
              </div>
              </>
              )}

          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
