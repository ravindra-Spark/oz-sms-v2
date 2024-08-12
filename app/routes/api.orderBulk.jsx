import { json } from "@remix-run/node";
import shopify from "/app/shopify.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');
  
  if (!startDate || !endDate) {
    throw new Error('Missing startDate or endDate');
  }

   // Adjust endDate to be one day after the provided endDate
   const endDateObj = new Date(endDate);
   const startDateObj = new Date(startDate);
   endDateObj.setDate(endDateObj.getDate() + 1);
   startDateObj.setDate(startDateObj.getDate() + 1);
   const adjustedEndDate = endDateObj.toISOString().split('T')[0];
   const adjustedstartDate = startDateObj.toISOString().split('T')[0];

  const { admin } = await shopify.authenticate.admin(request);
  const dateQuery = `created_at:>=${adjustedstartDate}T00:00:00Z AND created_at:<${adjustedEndDate}T00:00:00Z`;
  let allOrders = [];
  let hasNextPage = true;
  let endCursor = null;

  try {
    while (hasNextPage) {
      const response = await admin.graphql(`
        {
          orders(first: 250, query: "${dateQuery}"${endCursor ? `, after: "${endCursor}"` : ''}) {
            edges {
              node {
                id
                billingAddress {
                  phone
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `);

      const parsedResponse = await response.json();
      console.log("GraphQL response:", JSON.stringify(parsedResponse, null, 2));

      if (!parsedResponse || !parsedResponse.data) {
        throw new Error('Invalid response from Shopify API');
      }

      const orders = parsedResponse.data.orders.edges.map(edge => edge.node);
      allOrders = [...allOrders, ...orders];
      hasNextPage = parsedResponse.data.orders.pageInfo.hasNextPage;
      endCursor = parsedResponse.data.orders.pageInfo.endCursor;
    }

    return json({ orders: allOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Response("Failed to fetch orders", { status: 500 });
  }
}
