"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  // Don't render on onboarding, auth, or OS workspace pages
  const hiddenRoutes = ['/onboarding', '/attendance', '/career', '/placement', '/internships', '/dashboard'];
  if (hiddenRoutes.includes(pathname || '') || pathname?.startsWith('/auth')) return null;

  return (
    <footer className="bg-[#1d1d1f] w-full pt-12 pb-8 mt-auto text-[#86868b] text-[12px] font-sans leading-[1.33337]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8">
        
        {/* Footnotes Section */}
        <div className="pb-4 border-b border-[#424245] mb-6">
          <p className="mb-2">
            1. Simulation results are based on predictive models and do not guarantee actual academic outcomes. Always refer to your official university portal for verified grades.
          </p>
          <p className="mb-2">
            2. Placement eligibility algorithms track standard recruiter criteria but may not account for company-specific exceptions or unannounced policy changes.
          </p>
          <p>
            Apple, the Apple logo, and MacBook are trademarks of Apple Inc., used here purely for stylistic demonstration. Aevos is an independent project.
          </p>
        </div>

        {/* Directory Sitemap */}
        <nav className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 mb-8">
          <div>
            <h3 className="font-semibold text-white/90 mb-3">Platform</h3>
            <ul className="flex flex-col gap-2">
              <li><Link href="/" className="hover:text-white transition-colors">Academic Simulation</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Placement Tracking</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Dynamic Roadmap</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Aevos</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white/90 mb-3">Resources</h3>
            <ul className="flex flex-col gap-2">
              <li><Link href="/" className="hover:text-white transition-colors">API Documentation</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">University Guidelines</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Open Source</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white/90 mb-3">Company</h3>
            <ul className="flex flex-col gap-2">
              <li><Link href="/" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Ethics & Privacy</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white/90 mb-3">Account</h3>
            <ul className="flex flex-col gap-2">
              <li><Link href="/" className="hover:text-white transition-colors">Manage Aevos ID</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Data Export</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Preferences</Link></li>
            </ul>
          </div>
        </nav>

        {/* Footer Bottom */}
        <div className="pt-4 border-t border-[#424245] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
            <span>Copyright © {new Date().getFullYear()} Aevos Inc. All rights reserved.</span>
            <div className="flex items-center gap-3">
              <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span className="w-px h-3 bg-[#424245]"></span>
              <Link href="/" className="hover:text-white transition-colors">Terms of Use</Link>
              <span className="w-px h-3 bg-[#424245]"></span>
              <Link href="/" className="hover:text-white transition-colors">Legal</Link>
              <span className="w-px h-3 bg-[#424245]"></span>
              <Link href="/" className="hover:text-white transition-colors">Site Map</Link>
            </div>
          </div>
          <div>
            <span className="hover:text-white transition-colors cursor-pointer">India</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
