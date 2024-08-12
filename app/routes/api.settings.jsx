import { json } from "@remix-run/node";
import db from "../db.server";
import { authenticate } from "../shopify.server";
//import { cors } from "remix-utils/cors";

export async function loader({ request }) {
    try {
        const { session } = await authenticate.admin(request);
        
        let settings = await db.setting.findFirst({
            where: {
                shop: session.shop
            },
        });

        if (!settings) {
            settings = {
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
                otpMsg: '',
                shop: session.shop,
            };
        }

        return json(settings);
        
    } catch (error) {
        console.error('Error loading settings:', error);
        return json({
            error: 'Failed to load settings',
        }, {
            status: 500
        });
    }
}
