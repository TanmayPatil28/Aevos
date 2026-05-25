import LedgerCanvas from "@/components/os/ledger/LedgerCanvas";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ledger | GradeFlow OS",
  description: "Manage your academic courses and grades.",
};

export default function LedgerPage() {
  return (
    <div className="w-full animate-in fade-in duration-300">
      <LedgerCanvas />
    </div>
  );
}
