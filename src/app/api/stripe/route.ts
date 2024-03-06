import { decodeToken } from "@/lib/access-token";
import { cookies } from "next/headers";
import { db } from "../../../../db";
import { userSubscriptions } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";

const return_url = process.env.NEXT_BASE_URL + "/";

export async function GET() {
  try {
    const token = cookies().get("accessToken")?.value;
    if (!token)
      return Response.json({ error: "unauthorized" }, { status: 401 });
    const user = await decodeToken({ token });

    const _userSubscription = await db
      .select()
      .from(userSubscriptions)
      .limit(1)
      .where(eq(userSubscriptions.userId, user.id));

    if (_userSubscription[0] && _userSubscription[0].stripeCustomerId) {
      // trying to cancel at the billing portal
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: _userSubscription[0].stripeCustomerId,
        return_url,
      });
      return Response.json({ url: stripeSession.url });
    }

    // user's first time trying to subscribe
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: return_url,
      cancel_url: return_url,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "ChatPDF Pro",
              description: "Unlimited PDF sessions!",
            },
            unit_amount: 2000,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
      },
    });

    return Response.json({ url: stripeSession.url });
  } catch (error) {
    console.log("stripe error", error);
    return Response.json({ error: "internal server error" }, { status: 500 });
  }
}
