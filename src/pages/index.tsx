import type { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface HomeProps {}

const Home: NextPage<HomeProps> = () => {
  const session = useSession();

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex w-11/12 flex-col items-center justify-start space-y-4 md:w-1/2">
        <h1 className="my-4 text-3xl font-extrabold">Rainbow Kit + SIWE</h1>
        <div className="flex space-x-3">
          <ConnectButton />
          {session.status === "authenticated" && (
            <button
              className="whitespace-nowrap rounded-xl bg-white px-4 py-2 font-bold text-[#25292E] shadow-lg transition-transform duration-[125] hover:scale-105	"
              onClick={() => void signOut()}
            >
              Sign Out
            </button>
          )}
        </div>
        <pre className="w-full rounded-xl bg-gray-900 p-4 text-white">
          {JSON.stringify({ session }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Home;
