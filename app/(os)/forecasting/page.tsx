import ForecastingCanvas from "@/components/os/forecasting/ForecastingCanvas";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forecasting | Aevos",
  description: "Plan your academic trajectory.",
};

export default function ForecastingPage() {
  return (
    <div className="w-full animate-in fade-in duration-300">
      <ForecastingCanvas />
    </div>
  );
}
