import Image from "next/image";
import { Vortex } from "@/components/ui/vortex";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] bg-black items-center justify-items-center min-h-screen p-8 pb-20  sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">

        <Vortex>
          <div className="text-center sm:text-left">
            <h1 className="text-4xl text-white font-bold mb-2">Welcome to Kulp Blogs</h1>
            <p className="text-white text-lg mb-1">
              Explore the latest release updates, product improvements, and real user insight all in one place.
            </p>
          </div>
        </Vortex>


      </main>

    </div>
  );
}
