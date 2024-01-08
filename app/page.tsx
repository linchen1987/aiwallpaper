"use client";

import { useEffect, useState } from "react";

import Footer from "@/components/footer";
import Header from "@/components/header";
import Hero from "@/components/hero";
import Input from "@/components/input";
import { Wallpaper } from "@/types/wallpaper";
import Wallpapers from "@/components/wallpapers";
import { toast } from "sonner";

export default function Home() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWallpapers = async function (page: number) {
    try {
      const uri = "/api/get-wallpapers";
      const params = {
        page: page,
        limit: 50,
      };

      setLoading(true);
      const resp = await fetch(uri, {
        method: "POST",
        body: JSON.stringify(params),
      });
      setLoading(false);

      if (resp.ok) {
        const res = await resp.json();
        console.log("get wallpapers result: ", res);
        if (res.data) {
          setWallpapers(res.data);
          return;
        }
      }

      toast.error("get wallpapers failed");
    } catch (e) {
      console.log("get wallpapers failed: ", e);
      toast.error("get wallpapers failed");
    }
  };

  useEffect(() => {
    fetchWallpapers(1);
  }, []);

  return (
    <div className="w-screen h-screen">
      <Header />
      <section>
        <div className="mx-auto w-full max-w-7xl overflow-hidden px-5 py-10 md:px-10 lg:px-20 lg:py-2">
          <div className="flex flex-col items-center gap-y-16 pt-10 sm:gap-y-20 lg:pt-20">
            <div className="max-w-3xl">
              <Hero />
              <div className="mx-auto mb-4 flex max-w-lg justify-center">
                <Input wallpapers={wallpapers} setWallpapers={setWallpapers} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Wallpapers wallpapers={wallpapers} loading={loading} />
      <Footer />
    </div>
  );
}