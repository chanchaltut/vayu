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

      <div id="home"><Hero /></div>
      <div id="report"><CitizenUpload /></div>
      <div id="detect"><AiPrediction /></div>
      <div id="act"><Municipality /></div>
      <div id="team"><Footer /></div>
    </main>
  );
}
