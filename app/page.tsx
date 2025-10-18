import Image from "next/image";
// import { Vortex } from "@/components/ui/vortex";
import HomePage from "@/pages/Home";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] bg-black items-center justify-items-center min-h-screen p-8 pt-4 pb-20  sm:p-20 sm:pt-4">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <HomePage />

      </main>

    </div>
  );
}
