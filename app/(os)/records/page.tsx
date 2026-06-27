import RecordsCanvas from "@/components/os/records/RecordsCanvas";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Records | Aevos",
  description: "Import your official university records securely.",
};

export default function RecordsPage() {
  return (
    <div className="w-full animate-in fade-in duration-300">
      <RecordsCanvas />
    </div>
  );
}
