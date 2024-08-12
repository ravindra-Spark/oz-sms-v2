import { authenticate } from "../shopify.server";
import db from "../db.server";


const create_sms = (template, payload) => {
    const replacements = {
        "[name]": payload.billing_address.first_name + " " + payload.billing_address.last_name,
        "[first_name]": payload.billing_address.first_name || '',
        "[phone]": payload.billing_address.phone || '',
        "[email]": payload.email || '',
        "[address]": payload.billing_address.address1 || '',
        "[city]": payload.billing_address.city || '',
        "[order]": payload.name || '',
        "[currency]": payload.currency || '',
        "[amount]": payload.total_price || '',
        "[details]": payload.order_status_url || '',
        "[gateway]": payload.payment_gateway_names ? payload.payment_gateway_names.join(", ") : '',
        "[reason]": payload.cancel_reason || '',
        "[courier]": payload.fulfillments ? payload.fulfillments.tracking_company || '' : '',
        "[tracking]": payload.fulfillments ? payload.fulfillments.tracking_numbers || '' : '',
        "[link]": payload.fulfillments ? payload.fulfillments.tracking_url || '' : '',
        "[cart]": payload.checkout_id || ''
    };

    let sms_message = template;
    for (const [key, value] of Object.entries(replacements)) {
        sms_message = sms_message.replace(key, value);
    }
    return sms_message;
};

const fetchSettings = async (shop) => {
    
    console.log('Fetching settings for shop:', shop);
    try {
        
        const response = await fetch(`https://shopifyv1.ozonesender.com/api/helow?shop=${encodeURIComponent(shop)}`);
        if (response.ok) {
            const data = await response.json();
            console.log('Fetched settings data:', data);
            return data;
        } else {
            console.error('Failed to fetch settings:', response.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error fetching settings:', error);
        return null;
    }
};

const sendMessage = async (clientID, apiKey, senderID, message, mNumber, requestOptions) => {
    console.log('Sending message to:', mNumber);
    try {
        const sendResponse = await fetch(`https://api.ozonesender.com/v1/send/?user_id=${encodeURIComponent(clientID)}&api_key=${encodeURIComponent(apiKey)}&sender_id=${encodeURIComponent(senderID)}&message=${encodeURIComponent(message)}&recipient_contact_no=${encodeURIComponent(mNumber)}`, requestOptions);

        if (sendResponse.ok) {
            const sendData = await sendResponse.json();
            if (sendData !== null && sendData.status_code === 204) {
                console.log('Message sent successfully');
            } else {
                console.error('Failed to send message. API response:', sendData);
            }
        } else {
            console.error('Failed to send message. HTTP status:', sendResponse.status);
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
};


export const action = async ({ request }) => {
    try {
        const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

        if (!admin) {
            return new Response("Unauthorized", { status: 403 });
        }

        const handleOrderEvent = async (eventType, mobileNumber, settingsKey, messageKey) => {
            console.log(`${eventType} webhook called`);
            console.log('MobileNumber:', mobileNumber);
            console.log('Payload:', payload);

            if (mobileNumber && mobileNumber.startsWith("+")) {
                mobileNumber = mobileNumber.substring(1);
            }

            try {
                const settings = await fetchSettings(shop);
                if (settings && settings[settingsKey] === true) {
                    const { clientID, apiKey, senderID, [messageKey]: message } = settings;
                    const smsMessage = create_sms(message, payload);
                    console.log('Constructed SMS:', smsMessage);
                    const requestOptions = {
                        method: "GET",
                        redirect: "follow"
                    };

                    await sendMessage(clientID, apiKey, senderID, smsMessage, mobileNumber, requestOptions);
                } else {
                    console.log('Settings do not allow sending');
                }
            } catch (error) {
                console.error(`Error handling ${eventType}:`, error);
            }
        };

        switch (topic) {
            case "ORDERS_CREATE":
                await handleOrderEvent("ORDERS_CREATE", payload.customer.default_address.phone, "allowNewOrder", "newOrderMsg");
                break;
            case "ORDERS_CANCELLED":
                await handleOrderEvent("ORDERS_CANCELLED", payload.customer.default_address.phone, "allowCancel", "cancelMsg");
                break;
            case "ORDERS_FULFILLED":
                await handleOrderEvent("ORDERS_FULFILLED", payload.customer.default_address.phone, "allowComplete", "completeMsg");
                break;
            case "CHECKOUTS_CREATE":
                await handleOrderEvent("CHECKOUTS_CREATE", payload.customer.default_address.phone, "allowAbandoned", "abandonedMsg");
                break;
            case "APP_UNINSTALLED":
                if (session) {
                    await db.session.deleteMany({ where: { shop } });
                }
                break;
            default:
                throw new Response("Unhandled webhook topic", { status: 404 });
        }

        return new Response();
    } catch (error) {
        console.error('Error processing webhook action:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
