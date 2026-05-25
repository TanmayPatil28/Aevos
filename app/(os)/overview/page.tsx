import OverviewCanvas from "@/components/os/overview/OverviewCanvas";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview | GradeFlow OS",
  description: "Your academic orientation center.",
};

export default function OverviewPage() {
  return (
    <div className="w-full">
      <OverviewCanvas />
    </div>
  );
}
