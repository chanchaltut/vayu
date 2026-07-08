import Navbar from "@/components/navigation/Navbar";
import AiPrediction from "@/components/sections/AiPrediction";
import CitizenUpload from "@/components/sections/CitizenUpload";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import Municipality from "@/components/sections/Municipality";

export default function Home() {
  return (
    <main className="flex flex-col w-full min-h-screen relative">
      <Navbar />

      <Hero />
      <CitizenUpload />
      <AiPrediction />
      <Municipality />
      <Footer />
    </main>
  );
}
