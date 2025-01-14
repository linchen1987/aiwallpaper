"use client";

import {
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { AppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Poetry } from "@/types/Poetry";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  wallpapers: Poetry[];
  setWallpapers: Dispatch<SetStateAction<Poetry[]>>;
}

export default function ({ setWallpapers }: Props) {
  const { user, fetchUserInfo } = useContext(AppContext);

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [wallpaper, setWallpaper] = useState<Poetry | null>(null);
  const router = useRouter();

  const requestGenWallpaper = async function () {
    try {
      const uri = "/api/protected/gen-wallpaper";
      const params = {
        description: description,
      };

      setLoading(true);
      const resp = await fetch(uri, {
        method: "POST",
        body: JSON.stringify(params),
      });
      setLoading(false);

      if (resp.status === 401) {
        toast.error("Please Sign In");
        router.push("/sign-in");
        return;
      }
      console.log("gen wallpaper resp", resp);

      if (resp.ok) {
        const { code, message, data } = await resp.json();
        if (code !== 0) {
          toast.error(message);
          return;
        }
        if (data && data.img_url) {
          fetchUserInfo();

          setDescription("");

          const wallpaper: Poetry = data;
          setWallpaper(wallpaper);
          setWallpapers((wallpapers: Poetry[]) => [wallpaper, ...wallpapers]);

          toast.success("gen wallpaper ok");
          return;
        }
      }

      toast.error("gen wallpaper failed");
    } catch (e) {
      console.log("search failed: ", e);
      toast.error("gen wallpaper failed");
    }
  };

  const handleInputKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter" && !e.shiftKey) {
      if (e.keyCode !== 229) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const handleSubmit = function () {
    if (!description) {
      toast.error("invalid image description");
      inputRef.current?.focus();
      return;
    }

    if (!user) {
      toast.error("please sign in");
      return;
    }

    if (user.credits && user.credits.left_credits < 1) {
      toast.error("credits not enough");
      return;
    }

    requestGenWallpaper();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col w-full">
      <form
        className="flex w-full flex-col gap-3 sm:flex-row"
        onSubmit={() => {
          return false;
        }}
      >
        <Input
          type="text"
          placeholder="Wallpaper description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleInputKeydown}
          disabled={loading}
          ref={inputRef}
        />

        {/* <input
          type="button"
          value={loading ? "Generating..." : "Generate"}
          className="cursor-pointer rounded-md bg-black px-6 py-2 font-semibold text-white disabled:bg-gray-300"
          disabled={loading}
          onClick={handleSubmit}
        /> */}
        <Button type="button" disabled={loading} onClick={handleSubmit}>
          {loading ? "Generating..." : "Generate"}
        </Button>
      </form>
    </div>
  );
}
