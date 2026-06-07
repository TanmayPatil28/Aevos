import Navbar from "./Navbar";
import { createClient } from "@/lib/supabase/server";
import { MAIN_LINKS, INTELLIGENCE_MODULES } from "@/lib/config/navigation";

export default async function NavbarServer() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Determine user role (default to 'user' if not logged in or no role set)
  const userRole = user?.user_metadata?.role || 'user';

  // Create a plain object that we can safely pass to client components
  // Sometimes Supabase returns complex objects that can cause hydration issues
  const safeUser = user ? {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
  } : null;

  // Server-side filtering to prevent sensitive paths from leaking to client bundle
  const filteredModules = INTELLIGENCE_MODULES.map(module => ({
    ...module,
    items: module.items.filter(item => !item.role || item.role === 'all' || item.role === userRole)
  })).filter(module => module.items.length > 0);

  return <Navbar mainLinks={MAIN_LINKS} intelligenceModules={filteredModules} />;
}
