import { json } from "@remix-run/node";
import shopify from "/app/shopify.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');
  
  if (!startDate || !endDate) {
    throw new Error('Missing startDate or endDate');
  }

  const endDateObj = new Date(endDate);
  const startDateObj = new Date(startDate);
  endDateObj.setDate(endDateObj.getDate() + 1);
  startDateObj.setDate(startDateObj.getDate() + 1);
  const adjustedEndDate = endDateObj.toISOString().split('T')[0];
  const adjustedstartDate = startDateObj.toISOString().split('T')[0];

  const { admin } = await shopify.authenticate.admin(request);

  const dateQuery = `customer_date:>=${adjustedstartDate}T00:00:00Z AND customer_date:<${adjustedEndDate}T00:00:00Z`;
  

  try {
    const response = await admin.graphql(`
      {
        customers(first: 250, query: "${dateQuery}") {
          edges {
            node {
              id
              phone
              firstName
              lastName
              updatedAt
              addresses {
                phone
              }
            }
          }
        }
      }
    `);

    const parsedResponse = await response.json();

    // Log the raw response for debugging
    console.log("GraphQL response:", JSON.stringify(parsedResponse, null, 2));

    return json({
      customers: parsedResponse.data.customers.edges.map(edge => edge.node),
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Response("Failed to fetch customers", { status: 500 });
  }
}
