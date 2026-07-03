import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TimeLiquidityClient from "./TimeLiquidityClient";
import { sanitizeAdherenceNeutralText } from "@/lib/time-liquidity/sanitizer";

export { sanitizeAdherenceNeutralText };

export default async function TimeLiquidityPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    redirect("/auth");
  }

  return <TimeLiquidityClient />;
}
