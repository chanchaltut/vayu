import Navbar from "@/components/navigation/Navbar";
import AiPrediction from "@/components/sections/AiPrediction";
import CitizenUpload from "@/components/sections/CitizenUpload";
import Faq from "@/components/sections/Faq";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import Municipality from "@/components/sections/Municipality";
import { VayuDataProvider } from "@/lib/vayuData";

export default function Home() {
  return (
    <VayuDataProvider>
      <main className="relative flex w-full min-h-screen flex-col">
        <Navbar />
        <Hero />
        <CitizenUpload />
        <AiPrediction />
        <Municipality />
        <Faq />
        <Footer />
      </main>
    </VayuDataProvider>
  );
}
