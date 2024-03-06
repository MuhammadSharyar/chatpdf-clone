import { eq } from "drizzle-orm";
import { db } from "../../db";
import { userSubscriptions } from "../../db/schema";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const checkSubscription = async () => {
  const { user } = await fetch(`/api/get-user-details`).then((res) =>
    res.json()
  );

  if (!user) return false;

  const _userSubscription = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, user.id));

  if (!_userSubscription[0]) {
    return false;
  }

  const userSubscription = _userSubscription[0];

  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS >
      Date.now();

  return !!isValid;
};
