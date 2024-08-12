import React, { useState, useEffect} from 'react';
import { Card, Page, BlockStack, Grid, TextField,Text, useBreakpoints,Box,Button, Image ,LegacyCard} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate } from "@remix-run/react";
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import Swal from 'sweetalert2';
import {SendIcon} from '@shopify/polaris-icons';



export default function SettingPage() {
    const [balanceState, setBalanceState] = useState({
        status_code: '',
        current_balance: '',
    });

    const [formState, setFormState] = useState({
        senderID: '',
        clientID: '',
        apiKey: '',
        mNumber: '',
        message: ''
    });

    

    const imageUrlBulk = `https://box1.ozonedesk.info/upload/24Jul2024065929_bulk.png`;
    const imageUrllog = ` https://box1.ozonedesk.info/upload/24Jul2024070021_log.png`;
    const imageUrlset = `https://box1.ozonedesk.info/upload/24Jul2024065746_settings.png`;
    const imageUrlhelp = `https://box1.ozonedesk.info/upload/24Jul2024065848_help.png`;

    const [isClicked, setIsClicked] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isHoveredlog, setIsHoveredlog] = useState(false);
    const [isHoveredset, setIsHoveredset] = useState(false);
    const [isHoveredhelp, setIsHoveredhelp] = useState(false);
    

    const navigate = useNavigate();
   


    const { smUp } = useBreakpoints();

    const [settingsLoading, setSettingsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [buttonLoading, setButtonLoading] = useState(false);
 

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
            } finally {
                setSettingsLoading(false);
            }
        }
        fetchSettings();
    }, []);

    const clientID = formState.clientID;
    const apiKey = formState.apiKey;

    useEffect(() => {
        async function fetchBalance() {
            try {
                const requestOptions = {
                    method: "GET",
                    redirect: "follow"
                };
                const response = await fetch(`https://api.ozonesender.com/v1/getBalance/?user_id=${clientID}&api_key=${apiKey}`, requestOptions);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Balance data:', data); // Log the fetched balance data
                    setBalanceState(data);
                } else {
                    console.error('Failed to fetch balance, response status:', response.status);
                    const errorData = await response.json();
                    console.error('Error details:', errorData);
                    throw new Error('Failed to fetch balance');
                }
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
        }

        if (clientID && apiKey) {
            fetchBalance();
        }
    }, [clientID, apiKey]);

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

    const handleChange = (field) => (value) => {
        setFormState({ ...formState, [field]: value });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const { senderID, clientID, apiKey, mNumber, message } = formState;
        setButtonLoading(true);

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
                        // position: "bottom-start",
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
                    if(data.status_code === 203){
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "Contact Number is Invalid!",
                           // footer: '<a href="#">Why do I have this issue?</a>'
                        });
                    }else if(data.status_code === 207){
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "No Contact Numbers",
                           // footer: '<a href="#">Why do I have this issue?</a>'
                        });
                    }else if(data.status_code === 205){
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "Length of Contact is Invalid!",
                           // footer: '<a href="#">Why do I have this issue?</a>'
                        });
                    }else{
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: data.status_code,
                           // footer: '<a href="#">Why do I have this issue?</a>'
                        });
                    }
                    
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
        }finally {
            setButtonLoading(false); // Set loading state to false after response
        }
    };

    return (
        <Page>
            {/* <TitleBar title="oZoneSender" />   */}


            <LegacyCard sectioned>
        <Grid
          columns={{xs: 1, sm: 4, md: 4, lg: 6, xl: 6}}
          areas={{
            xs: ['product', 'sales', 'orders'],
            sm: [
              'product product product product',
              'sales sales orders orders',
            ],
            md: ['sales product product orders'],
            lg: ['product product product product sales orders'],
            xl: ['product product sales sales orders orders'],
          }}
        >
          <Grid.Cell area="product">
          <Image
           source="https://box1.ozonedesk.info/upload/02Apr2024093832_logooz.png"
                            alt="Logo"
                            style={{
                                maxWidth: '70%',
                                height: '30%',
                              
                                margin: '5px 0px 10px 10px',
                            }}
                        />
                        <div style={{ height: '0px', marginBottom:'50px' }}  >
                       <Card >
                        <div >
                            <p style={{ fontSize: '16px' }}>Balance: {balanceState.current_balance}</p>
                        </div>
                        <text as="p" variant="bodyMd" style={{ fontSize: '10px' }}>
                            To top up the account, you must log into <a href="https://ozonesender.com/" target="_blank">ozoneSender</a>
                        </text>
                        </Card></div><br/>       
          </Grid.Cell>


          <Grid.Cell area="sales">
          <Grid>
            <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>    
            <div 
            style={{ 
                backgroundColor: isHovered ? '#3450A1' : '#4872F0', 
                padding: '10px', 
                borderRadius: '8px', 
                marginTop: '15px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                transition: 'background-color 0.3s ease' // Smooth transition
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div 
                style={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                }}
                onClick={() => {
                    setIsClicked(!isClicked); 
                    navigate("/app/bulkselector");
                }}>
                <Image
                    source={imageUrlBulk}
                    alt="Logo"
                    style={{
                        width: '30%',
                        height: '10%',
                        margin: '10% 10% 10% 10%'
                    }}
                />
            </div>                            
            <p style={{
                fontSize: '15px',
                color: 'white',    
                textAlign: 'center',                
            }}>
                Bulk SMS
            </p>                                                    
        </div>
        </Grid.Cell>


        <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
        <a style ={{textDecoration:'none'}}href="https://portal.ozonesender.com" target="_blank">
        <div 
            style={{ 
                backgroundColor: isHoveredlog ? '#4872F0' : '#3450A1 ',
                padding: '10px', 
                borderRadius: '8px', 
                marginTop: '15px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                transition: 'background-color 0.3s ease' 
            }}
            onMouseEnter={() => setIsHoveredlog(true)}
            onMouseLeave={() => setIsHoveredlog(false)}
        >
            <div 
                style={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                }}
                
                >
                <Image
                    source={imageUrllog}
                    alt="Logo"
                    style={{
                        width: '30%',
                        height: '10%',
                        margin: '10% 10% 10% 10%'
                    }}
                />
            </div>                            
            <p style={{
                fontSize: '15px',
                color: 'white',    
                textAlign: 'center',                
            }}>
               SMS Log
            </p>                                                    
        </div></a>
        </Grid.Cell>
      </Grid>
          </Grid.Cell>

          {/* dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffg */}
          <Grid.Cell area="orders">
          <Grid>
        <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
        <div 
            style={{ 
                backgroundColor: isHoveredset ? '#666666' : '#494949', 
                padding: '10px', 
                borderRadius: '8px', 
                marginTop: '15px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                transition: 'background-color 0.3s ease' 
            }}
            onMouseEnter={() => setIsHoveredset(true)}
            onMouseLeave={() => setIsHoveredset(false)}
        >
            <div 
                style={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                }}
                onClick={() => {
                    setIsClicked(!isClicked); 
                    navigate("/app/settingPage");
                }}>
                <Image
                    source={imageUrlset}
                    alt="Logo"
                    style={{
                        width: '30%',
                        height: '10%',
                        margin: '10% 10% 10% 10%'
                    }}
                />
            </div>                            
            <p style={{
                fontSize: '15px',
                color: 'white',    
                textAlign: 'center',                
            }}>
                Settings
            </p>                                                    
        </div>
        </Grid.Cell>

        <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
        <a style ={{textDecoration:'none'}}href="https://ozonesender.com/document.html" target="_blank">
        <div 
            style={{ 
                backgroundColor: isHoveredhelp ? '#494949' : '#666666', 
                padding: '10px', 
                borderRadius: '8px', 
                marginTop: '15px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                transition: 'background-color 0.3s ease' // Smooth transition
            }}
            onMouseEnter={() => setIsHoveredhelp(true)}
            onMouseLeave={() => setIsHoveredhelp(false)}
        >
            <div 
                style={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                }}
                onClick={() => {
                    setIsClicked(!isClicked); 
                    // navigate("/app/help");
                }}>
                <Image
                    source={imageUrlhelp}
                    alt="Logo"
                    style={{
                        width: '30%',
                        height: '10%',
                        margin: '10% 10% 10% 10%'
                    }}
                />
            </div>                            
            <p style={{
                fontSize: '15px',
                color: 'white',    
                textAlign: 'center',                
            }}>
                Help
            </p>                                                    
        </div></a>
        </Grid.Cell>
      </Grid>
          </Grid.Cell>  
             </Grid>
               </LegacyCard><br/>
 {/* dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffg */}

      

            <form onSubmit={handleSubmit}>
                <BlockStack gap={{ xs: "800", sm: "400" }}>
                    <Card roundedAbove="md">
                        <BlockStack gap="400">
                            <Text>Send Individual SMS</Text>
                            <Grid columns={{ sm: 3 }}>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                </Grid.Cell>
                            </Grid>
                           
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
                        
                        <Box style={{ textAlign: 'right', paddingRight: '0rem', marginTop:'10px'}} >
                        {/* <Button submit>Send Message</Button> */}
                        <Button icon={SendIcon} submit loading={buttonLoading}>Send Message</Button>
                        </Box>
                    </Card> 
                  
                </BlockStack>
            </form>
            <br/>

    </Page>
  );
}

const Placeholder = ({height = 'auto', width = 'auto'}) => {
  return (
    <div
      style={{
        background: 'var(--p-color-text-info)',
        height: height,
        width: width,
      }}
    /> );
};


            
               
