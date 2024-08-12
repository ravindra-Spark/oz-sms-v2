// import cron from 'node-cron';
// import { json } from "@remix-run/node";
// import db from "../db.server";
// import { cors } from "remix-utils/cors";
// import { authenticate } from "../shopify.server";

// let formState = {
//     senderID: '',
//     clientID: '',
//     apiKey: '',
// };

// const fetchSettings = async () => {
//     console.log('Fetching settings for shop:');
//     try {
//         const response = await fetch('https://magical-bill-beaches-til.trycloudflare.com/api/settings');
//         if (response.ok) {
//             const data = await response.json();
//             console.log('Fetched settings data:', data);
//             return data;
//         } else {
//             console.error('Failed to fetch settings:', response.statusText);
//             return null;
//         }
//     } catch (error) {
//         console.error('Error fetching settings:', error);
//         return null;
//     }
// };

// export async function action({ request }) {
//     const { session } = await authenticate.admin(request);
//    return session.shop
// }




// // Define the cron job
// const job = cron.schedule('* * * * *', async () => {
//     console.log('Helloww, World!');
//     const settings = await fetchSettings();
//     console.log(settings);
// }, {
//     scheduled: false // Prevent automatic scheduling
// });

// // Start the job only once
// if (!job.running) {
//     job.start();
// }
