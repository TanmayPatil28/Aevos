"use client";

/**
 * WorkspaceAtmosphere — Previously rendered 2 giant blur-[120px] divs covering 80vw×80vh.
 * Removed because DashboardClient already provides its own ambient background,
 * and stacking multiple blur layers was the #2 performance killer.
 * 
 * Kept as a no-op component to avoid breaking imports.
 */
export default function WorkspaceAtmosphere() {
  return null;
}
