import React, { useState, useEffect } from 'react';
import { TextField, Box, Card, Page, Text, BlockStack, InlineGrid, Divider, useBreakpoints, Button, Grid, Image, Layout, LegacyCard   } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import Swal from 'sweetalert2';
import { HomeFilledIcon } from '@shopify/polaris-icons'; 
import { useNavigate } from "@remix-run/react";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';




export default function SettingPage() {
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [buttonLoading, setButtonLoading] = useState(false);
    //const { session } = await authenticate.admin(request);
    const [bannerhide, setbannerhide] = useState({
        senderID: '',
        clientID: '',
        apiKey: '',
        
        
    });
    const navigate = useNavigate();
    const [formState, setFormState] = useState({
        senderID: '',
        clientID: '',
        apiKey: '',
        allowNewOrder: false,
        newOrderMsg: '',
        allowCancel: false,
        cancelMsg: '',
        allowComplete: false,
        completeMsg: '',
        allowAbandoned: false,
        abandonedMsg: '',
        allowOTP: false,
        otpMsg: ''
    });

    const { smUp } = useBreakpoints();
    const clientID = bannerhide.clientID;
    const apiKey = bannerhide.apiKey;
    const senderID = bannerhide.senderID;
    const showConfigDetails = clientID && apiKey && senderID;

    useEffect(() => {
        async function fetchSettings() {
            try {
                const response = await fetch('https://shopifyv1.ozonesender.com/api/settings');
                if (response.ok) {
                    const data = await response.json();
                    setFormState(data);
                    setbannerhide(data);
                } else {
                    throw new Error('Failed to fetch settings');
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setSettingsLoading(false);
            }
        }
        fetchSettings();
    }, []);

    useEffect(() => {
        if (settingsLoading) {
            const interval = setInterval(() => {
                setProgress(prevProgress => (prevProgress >= 100 ? 0 : prevProgress + 1));
            }, 20);

            return () => clearInterval(interval);
        }
    }, [settingsLoading]);


    if (settingsLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',  
                alignItems: 'center',     
                minHeight: '50vh',       
                           
            }}>
                <div style={{ width: 100, height: 100 }}>
                    <CircularProgressbar value={progress} />
                </div>
            </div>
        );
    }
    

    const handleCheckboxChange = (name) => {
        setFormState((prevState) => ({
            ...prevState,
            [name]: !prevState[name],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setButtonLoading(true);

        try {
            const response = await fetch('https://shopifyv1.ozonesender.com/api/settingsCreate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formState),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.message === "Settings Update Success!") {
                    Swal.fire({
                        // position: "bottom-start",
                        icon: "success",
                        title: "Settings Update Success!",
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        window.location.reload(); // Reload page or update state as needed
                    });
                } else if (data.message === "Missing data. Required: senderID, clientID, apiKey") {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Required: senderID, clientID, apiKey",
                    });
                } else {
                    console.error('Unexpected response message:', data.message);
                }
            } else {
                console.error('Failed to save settings');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "There was a problem with your request. Please try again later.",
            });
        } finally {
            setButtonLoading(false);
        }
    };

const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'flex-end', 
    padding: '2px', 
   
  };

    return (
        <Page>
             {showConfigDetails && (
          <div style={buttonContainerStyle}onClick={() => {
                    navigate("/app/registerPage");
                }}>
        <Button icon={HomeFilledIcon} >Back to Dashboard</Button>
     
      <Divider /> </div>)}

            {/* <TitleBar title="oZoneSender" /> */}
            {!showConfigDetails && (
    <BlockStack gap={{ xs: "800", sm: "400" }}>
        <Card roundedAbove="md">
            <BlockStack gap="400">
                <Grid columns={{ sm: 2 }}>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 4, xl: 6 }}>
                        <Image
                            source="https://box1.ozonedesk.info/upload/02Apr2024093832_logooz.png"
                            alt="Logo"
                            style={{
                                maxWidth: '70%',
                                height: '25%',
                                display: 'block',
                                margin: '80px 60px 120px 80px',
                            }}
                        />
                        <button style={{
                            padding: '10px 25px',
                            display: 'block',
                            margin: '-100px 60px 60px 90px',
                            cursor: 'pointer',
                            backgroundColor: '#2844af',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            textDecoration: 'none'
                        }}>
                            <a href="https://ozonesender.com/" style={{ color: '#fff', textDecoration: 'none' }}>
                                Register Now
                            </a>
                        </button>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 4, xl: 6 }}>
                        <div>
                            <p>
                                Stay connected with your customers effortlessly with our Shopify SMS Alert App. Get started today and enhance your store's communication strategy!
                            </p><br />
                            <h3>Key Features:</h3>
                            <ul>
                                <li>Instant SMS notifications for Order Create, Order Cancel, Order Complete.</li>
                                <li>Customizable templates to align with your brand voice.</li>
                                <li>Real-time updates ensure customers are always informed.</li>
                                <li>Send Bulk Marketing SMS to Orders.</li>
                                <li>Send Bulk Marketing SMS to Customers.</li>
                                <li>Boost customer satisfaction and loyalty with timely alerts.</li>
                                <li>Easy integration and setup.</li>
                            </ul>
                        </div>
                    </Grid.Cell>
                </Grid>
            </BlockStack>
        </Card>
    </BlockStack>
    
)}
   

            <br/>
            <form onSubmit={handleSubmit}>
            <h1 as="h1" variant="headingMd" style={{ fontSize: '25px' }}>
            Settings Configuration
            </h1><br/>
           
                <BlockStack gap={{ xs: "800", sm: "400" }}>
                    <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
                        <Box as="section" paddingInlineStart={{ xs: 400, sm: 0 }} paddingInlineEnd={{ xs: 400, sm: 0 }}>
                        <BlockStack gap="100">
                                {/* <Text as="h3" variant="headingMd">New Order SMS</Text> */}
                                <BlockStack gap="200">
                                    <Card roundedAbove="md" backgroundColor='green'>
                                    <Text as="p" variant="bodyMd"><strong>Step 1</strong>: To send sms you must have an account in <a href="https://ozonesender.com">ozoneSender</a></Text></Card>
                                    <Card roundedAbove="md">
                                    <Text as="p" variant="bodyMd"><strong>Step 2</strong>: The user ID, API key and Sender ID are located in Ozonesender's API and Sender ID List section .</Text></Card>
                                    <Card roundedAbove="md">
                                    <Text as="p" variant="bodyMd"><strong>Step 3</strong>: Configure sms template in App setting.</Text></Card>
                                </BlockStack>
                            </BlockStack>
                        </Box>
                        <Card roundedAbove="sm">
                            <BlockStack gap="400">
                                <TextField
                                    label="Sender ID"
                                    name="senderID"
                                    value={formState.senderID}
                                    onChange={(value) => setFormState({ ...formState, senderID: value })}
                                    type="text"
                                    autoComplete="off"
                                />
                                <TextField
                                    label="Client ID"
                                    name="clientID"
                                    value={formState.clientID}
                                    onChange={(value) => setFormState({ ...formState, clientID: value })}
                                    type="text"
                                    autoComplete="off"
                                />
                                <TextField
                                    label="API Key"
                                    name="apiKey"
                                    value={formState.apiKey}
                                    onChange={(value) => setFormState({ ...formState, apiKey: value })}
                                    type="text"
                                    autoComplete="off"
                                />
                            </BlockStack>
                        </Card>
                    </InlineGrid>
                    {smUp && <Divider />}
                    <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
                        <Box as="section" paddingInlineStart={{ xs: 400, sm: 0 }} paddingInlineEnd={{ xs: 400, sm: 0 }}>
                            <BlockStack gap="100">
                                <Text as="h3" variant="headingMd">New Order SMS</Text>
                                <BlockStack gap="0">
                                    <Text as="p" variant="bodyMd">[name] - Show full name</Text>
                                    <Text as="p" variant="bodyMd">[first_name] - Show first name</Text>
                                    <Text as="p" variant="bodyMd">[phone] - Show customer phone</Text>
                                    <Text as="p" variant="bodyMd">[email] - Show customer email</Text>
                                    <Text as="p" variant="bodyMd">[address] - Show customer address</Text>
                                    <Text as="p" variant="bodyMd">[city] - Show customer city</Text>
                                    <Text as="p" variant="bodyMd">[order] - Show order number</Text>
                                    <Text as="p" variant="bodyMd">[currency] - Show order currency</Text>
                                    <Text as="p" variant="bodyMd">[amount] - Show order amount</Text>
                                    <Text as="p" variant="bodyMd">[details] - Show order details link</Text>
                                    <Text as="p" variant="bodyMd">[gateway] - Show payment gateway</Text>
                                </BlockStack>
                            </BlockStack>
                        </Box>
                        <Card roundedAbove="sm">
                            <BlockStack gap="400">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="allowNewOrder"
                                        checked={formState.allowNewOrder}
                                        onChange={() => handleCheckboxChange("allowNewOrder")}
                                    />
                                   Allow New Order SMS
                                </label>
                                <TextField
                                    label="New Order Message"
                                    name="newOrderMsg"
                                    value={formState.newOrderMsg}
                                    onChange={(value) => setFormState({ ...formState, newOrderMsg: value })}
                                    type="text"
                                    autoComplete="off"
                                    multiline={4}
                                />
                                <label>Sample: Hello [name], your order [order] has been received. Order amount is [currency] [amount]. We will deliver your order in 3 to 5 days. Thank you
                                </label>
                            </BlockStack>
                        </Card>
                    </InlineGrid>
                    {smUp && <Divider />}
                    <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
                        <Box as="section" paddingInlineStart={{ xs: 400, sm: 0 }} paddingInlineEnd={{ xs: 400, sm: 0 }}>
                            <BlockStack gap="100">
                                <Text as="h3" variant="headingMd">Cancel Order SMS</Text>
                                <BlockStack gap="0">
                                    <Text as="p" variant="bodyMd">[name] - Show full name</Text>
                                    <Text as="p" variant="bodyMd">[first_name] - Show first name</Text>
                                    <Text as="p" variant="bodyMd">[phone] - Show customer phone</Text>
                                    <Text as="p" variant="bodyMd">[email] - Show customer email</Text>
                                    <Text as="p" variant="bodyMd">[address] - Show customer address</Text>
                                    <Text as="p" variant="bodyMd">[city] - Show customer city</Text>
                                    <Text as="p" variant="bodyMd">[order] - Show order number</Text>
                                    <Text as="p" variant="bodyMd">[currency] - Show order currency</Text>
                                    <Text as="p" variant="bodyMd">[amount] - Show order amount</Text>
                                    <Text as="p" variant="bodyMd">[reason] - Show order cancel reason</Text>
                                    <Text as="p" variant="bodyMd">[gateway] - Show payment gateway</Text>
                                </BlockStack>
                            </BlockStack>
                        </Box>
                        <Card roundedAbove="sm">
                            <BlockStack gap="400">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="allowCancel"
                                        checked={formState.allowCancel}
                                        onChange={() => handleCheckboxChange("allowCancel")}
                                    />
                                   Allow Cancel Order SMS
                                </label>
                                <TextField
                                    label="Cancel Message"
                                    name="cancelMsg"
                                    value={formState.cancelMsg}
                                    onChange={(value) => setFormState({ ...formState, cancelMsg: value })}
                                    type="text"
                                    autoComplete="off"
                                    multiline={4}
                                />
                                <label>Sample: Hello [name], your order [order] has been cancelled. Order cancel reason is [reason]. Thank you
                                </label>
                            </BlockStack>
                        </Card>
                    </InlineGrid>
                    {smUp && <Divider />}
                    <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
                        <Box as="section" paddingInlineStart={{ xs: 400, sm: 0 }} paddingInlineEnd={{ xs: 400, sm: 0 }}>
                            <BlockStack gap="100">
                                <Text as="h3" variant="headingMd">Order Fulfillment SMS</Text>
                                <BlockStack gap="0">
                                    <Text as="p" variant="bodyMd">[name] - Show full name</Text>
                                    <Text as="p" variant="bodyMd">[first_name] - Show first name</Text>
                                    <Text as="p" variant="bodyMd">[phone] - Show customer phone</Text>
                                    <Text as="p" variant="bodyMd">[email] - Show customer email</Text>
                                    <Text as="p" variant="bodyMd">[address] - Show customer address</Text>
                                    <Text as="p" variant="bodyMd">[city] - Show customer city</Text>
                                    <Text as="p" variant="bodyMd">[order] - Show order number</Text>
                                    <Text as="p" variant="bodyMd">[courier] - Show courier company</Text>
                                    <Text as="p" variant="bodyMd">[tracking] - Show courier tracking</Text>
                                    <Text as="p" variant="bodyMd">[link] - Show courier tracking link</Text>
                                </BlockStack>
                            </BlockStack>
                        </Box>
                        <Card roundedAbove="sm">
                            <BlockStack gap="400">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="allowComplete"
                                        checked={formState.allowComplete}
                                        onChange={() => handleCheckboxChange("allowComplete")}
                                    />
                                    Allow Order Fulfillment SMS
                                </label>
                                <TextField
                                    label="Complete Message"
                                    name="completeMsg"
                                    value={formState.completeMsg}
                                    onChange={(value) => setFormState({ ...formState, completeMsg: value })}
                                    type="text"
                                    autoComplete="off"
                                    multiline={4}
                                />
                                <label>Sample: Hello, your order [order] has been shipped. Courier is [courier] and tracking [tracking]. Track: [link]
                                </label>
                            </BlockStack>
                        </Card>
                    </InlineGrid>
                    {smUp && <Divider />}
                    {/* <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
                        <Box as="section" paddingInlineStart={{ xs: 400, sm: 0 }} paddingInlineEnd={{ xs: 400, sm: 0 }}>
                            <BlockStack gap="400">
                                <Text as="h3" variant="headingMd">Abandoned Cart SMS</Text>
                                <BlockStack gap="0">
                                    <Text as="p" variant="bodyMd">[name] - Show full name</Text>
                                    <Text as="p" variant="bodyMd">[phome] - Show customer phone</Text>
                                    <Text as="p" variant="bodyMd">[currency] - Show order currency</Text>
                                    <Text as="p" variant="bodyMd">[amount] - Show order amount</Text>
                                    <Text as="p" variant="bodyMd">[cart] - Show abandoned cart link</Text>
                                </BlockStack>
                            </BlockStack>
                        </Box>
                        <Card roundedAbove="sm">
                            <BlockStack gap="400">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="allowAbandoned"
                                        checked={formState.allowAbandoned}
                                        onChange={() => handleCheckboxChange("allowAbandoned")}
                                    />
                                    Allow Abandoned Cart SMS
                                </label>
                                <TextField
                                    label="Abandoned Message"
                                    name="abandonedMsg"
                                    value={formState.abandonedMsg}
                                    onChange={(value) => setFormState({ ...formState, abandonedMsg: value })}
                                    type="text"
                                    autoComplete="off"
                                    multiline={4}
                                />
                                <label>Sample: Hello [name], your order of [currency] [amount] has been in our cart. Use coupon 10DC and get 10% discount. Order now: [cart]
                                </label>
                            </BlockStack>
                        </Card>
                    </InlineGrid>
                    {smUp && <Divider />} */}
                    <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
                        {/* <Box as="section" paddingInlineStart={{ xs: 400, sm: 0 }} paddingInlineEnd={{ xs: 400, sm: 0 }}>
                            <BlockStack gap="400">
                                <Text as="h3" variant="headingMd">SMS Settings for OTP Notifications</Text>
                            </BlockStack>
                        </Box> */}
                        {/* <Card roundedAbove="sm">
                            <BlockStack gap="400">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="allowOTP"
                                        checked={formState.allowOTP}
                                        onChange={() => handleCheckboxChange("allowOTP")}
                                    />
                                    Allow OTP SMS
                                </label>
                                <TextField
                                    label="OTP Message"
                                    name="otpMsg"
                                    value={formState.otpMsg}
                                    onChange={(value) => setFormState({ ...formState, otpMsg: value })}
                                    type="text"
                                    autoComplete="off"
                                />
                            </BlockStack>
                        </Card> */}
                        {smUp && <Divider />}
                        <Box style={{ textAlign: 'right', paddingRight: '0rem' }} >
                        <Button submit  loading={buttonLoading}>Save Settings</Button>
                        </Box><br/>
                    </InlineGrid>

                   
                </BlockStack>
            </form>
        </Page>
    );
}