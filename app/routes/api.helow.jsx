import { json } from "@remix-run/node";
import db from "../db.server";

export async function loader({ request }) {
    try {
        const url = new URL(request.url);
        const shop = url.searchParams.get("shop");
        let settings = await db.setting.findFirst({
            where: {
                shop: shop
            },
        });

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
