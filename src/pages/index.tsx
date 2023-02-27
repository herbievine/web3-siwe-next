import type { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface HomeProps {}

const Home: NextPage<HomeProps> = () => {
  const session = useSession();

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex w-11/12 flex-col items-center justify-start space-y-6 md:w-1/2">
        <h1 className="text-3xl font-extrabold">
          Rainbow Kit + SIWE (+ Magic?)
        </h1>
        <div className="flex w-full flex-col items-center space-y-4">
          <ConnectButton />
          <pre className="w-full rounded-xl bg-gray-900 p-4 text-white">
            {JSON.stringify({ session }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Home;
