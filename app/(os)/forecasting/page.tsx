import ForecastingCanvas from "@/components/os/forecasting/ForecastingCanvas";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forecasting | GradeFlow OS",
  description: "Plan your academic trajectory.",
};

export default function ForecastingPage() {
  return (
    <div className="w-full animate-in fade-in duration-300">
      <ForecastingCanvas />
    </div>
  );
}
