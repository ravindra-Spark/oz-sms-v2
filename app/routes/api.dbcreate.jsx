import { json } from "@remix-run/node";
import db from "../db.server";
import { cors } from "remix-utils/cors";
import { authenticate } from "../shopify.server";

export async function action({ request }) {
    const { session } = await authenticate.admin(request);
    try {
        const method = request.method.toUpperCase();

       
        const data = await request.json();

        //  validation
        const { senderID, clientID, apiKey } = data;
        if (!senderID || !clientID || !apiKey) {
            return json({
               
                message: "Missing data. Required: senderID, clientID, apiKey",
                method: method
            });
        }

        switch (method) {
            case "POST":
                const settings = {
                    senderID: data.senderID,
                    clientID: data.clientID,
                    apiKey: data.apiKey,
                    allowNewOrder: data.allowNewOrder,
                    newOrderMsg: data.newOrderMsg,
                    allowCancel: data.allowCancel,
                    cancelMsg: data.cancelMsg,
                    allowComplete: data.allowComplete,
                    completeMsg: data.completeMsg,
                    allowAbandoned: data.allowAbandoned,
                    abandonedMsg: data.abandonedMsg,
                    allowOTP: data.allowOTP,
                    otpMsg: data.otpMsg,
                    //shop: session.shop
                };

                await db.Setting.upsert({
                    //where: { shop: session.shop },
                    where: { shop: session.shop, },
                    update: settings,
                    create: { shop: session.shop, ...settings }
                });

                const response = json({ message: "Settings Update Success!", method: "POST" });
                return cors(request, response);

            case "PATCH":
               
                return json({ message: "Success", method: "PATCH" });

            default:
                return new Response("Method Not Allowed", { status: 405 });
        }
    } catch (error) {
        console.error('Error processing request:', error);
        throw error; 
    }
}
