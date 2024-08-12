import React, { useState, useEffect } from 'react';
import { TextField, Box, Card, Page, BlockStack, Divider, useBreakpoints, Button, Grid } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import Swal from 'sweetalert2';
//import { application_url } from "../../shopify.app"

export default function SettingPage() {
    const [formState, setFormState] = useState({
        senderID: '',
        clientID: '',
        apiKey: '',
        mNumber: '',
        message: ''
    });

    const { smUp } = useBreakpoints();

    useEffect(() => {
        async function fetchSettings() {
            const response = await fetch('https://shopifyv1.ozonesender.com/api/settings');
            if (response.ok) {
                const data = await response.json();
                setFormState(data);
            }
        }
        fetchSettings();
    }, []);

    const handleChange = (field) => (value) => {
        setFormState({ ...formState, [field]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { senderID, clientID, apiKey, mNumber, message } = formState;

        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };

        try {
            const response = await fetch(`https://api.ozonesender.com/v1/send/?user_id=${clientID}&api_key=${apiKey}&sender_id=${senderID}&message=${message}&recipient_contact_no=${mNumber}`, requestOptions);

            if (response.ok) {
                const data = await response.json();
                if (data.status_code === 204) {
                    Swal.fire({
                        position: "bottom-start",
                        icon: "success",
                        title: "Message sent successfully!",
                        showConfirmButton: false,
                        timer: 1500
                    });
                    // Clear mobile number and message fields
                    setFormState((prevState) => ({
                        ...prevState,
                        mNumber: '',
                        message: ''
                    }));
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: data.status_code,
                       // footer: '<a href="#">Why do I have this issue?</a>'
                    });
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Failed to send message",
                    //footer: '<a href="#">Why do I have this issue?</a>'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "An unexpected error occurred",
               // footer: '<a href="#">Why do I have this issue?</a>'
            });
        }
    };

    return (
        <Page>
            {/* <TitleBar title="oZoneSender" /> */}
            <form onSubmit={handleSubmit}>
                <BlockStack gap={{ xs: "800", sm: "400" }}>
                    <Card roundedAbove="md">
                        <BlockStack gap="400">
                            <Grid columns={{ sm: 3 }}>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                    <TextField
                                        label="Sender ID"
                                        name="senderID"
                                        value={formState.senderID}
                                        onChange={handleChange('senderID')}
                                        type="text"
                                        autoComplete="off"
                                    />
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                    <TextField
                                        label="Client ID"
                                        name="clientID"
                                        value={formState.clientID}
                                        onChange={handleChange('clientID')}
                                        type="text"
                                        autoComplete="off"
                                    />
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                    <TextField
                                        label="API Key"
                                        name="apiKey"
                                        value={formState.apiKey}
                                        onChange={handleChange('apiKey')}
                                        type="text"
                                        autoComplete="off"
                                    />
                                </Grid.Cell>
                            </Grid>
                            <Divider />
                            <TextField
                                label="Mobile Number (Number Format : 94773671595)"
                                name="mNumber"
                                value={formState.mNumber}
                                onChange={handleChange('mNumber')}
                                type="text"
                                autoComplete="off"
                                placeholder="Enter Mobile Number"
                            />
                            <TextField
                                label="Message"
                                name="message"
                                value={formState.message}
                                onChange={handleChange('message')}
                                type="text"
                                multiline={4}
                                autoComplete="off"
                                 placeholder="Message..."
                            />
                        </BlockStack>
                    </Card>
                    {smUp && <Divider />}
                    <Box style={{ textAlign: 'right', paddingRight: '0rem' }} >
                        <Button submit>Send Message</Button>
                    </Box>
                </BlockStack>
            </form>
        </Page>
    );
}
