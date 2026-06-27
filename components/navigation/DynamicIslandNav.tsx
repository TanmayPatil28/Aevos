import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { MAIN_LINKS, OS_LINKS, INTELLIGENCE_MODULES } from "@/config/navigation";

export default async function DynamicIslandNav() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Determine user role (default to 'user' if not logged in or no role set)
  const userRole = user?.user_metadata?.role || 'user';

  // Server-side filtering to prevent sensitive paths from leaking to client bundle
  const filteredModules = INTELLIGENCE_MODULES.map(module => ({
    ...module,
    items: module.items.filter(item => !item.role || item.role === 'all' || item.role === userRole)
  })).filter(module => module.items.length > 0);

  return (
    <Navbar
      mainLinks={MAIN_LINKS}
      osLinks={OS_LINKS}
      intelligenceModules={filteredModules}
    />
  );
}
