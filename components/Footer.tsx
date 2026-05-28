import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-container-low w-full py-12 mt-auto border-t border-outline-variant/15">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto">
        <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
          <div className="text-lg font-bold text-on-surface mb-2 font-headline">GradeFlow Academic Observatory</div>
          <div className="text-on-surface/50 font-body text-sm tracking-wide">
            © {new Date().getFullYear()} GradeFlow. Built by <span className="text-primary font-medium hover:underline cursor-pointer">Snehal Palaskar & Tanmay Patil</span>.
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-8 font-body text-sm tracking-wide">
          <Link className="text-on-surface/50 hover:text-secondary transition-colors cursor-pointer" href="/">Privacy Policy</Link>
          <Link className="text-on-surface/50 hover:text-secondary transition-colors cursor-pointer" href="/">Terms of Service</Link>
          <Link className="text-on-surface/50 hover:text-secondary transition-colors cursor-pointer" href="/">Help Center</Link>
          <Link className="text-on-surface/50 hover:text-secondary transition-colors cursor-pointer" href="/">API Documentation</Link>
        </div>
      </div>
    </footer>
  );
}
