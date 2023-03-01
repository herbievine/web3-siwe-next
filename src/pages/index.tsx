import type { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

interface HomeProps {}

const Home: NextPage<HomeProps> = () => {
  const session = useSession();
  const { connector, ...account } = useAccount();

  return (
    <div className="mt-12 flex w-full justify-center">
      <div className=" flex w-11/12 max-w-5xl flex-col items-center justify-start space-y-6">
        <h1 className="text-3xl font-extrabold">Rainbow Kit + SIWE</h1>
        <div className="flex w-full flex-col items-center space-y-4">
          <ConnectButton />
          <pre className="w-full overflow-x-scroll rounded-xl bg-gray-900 p-4 text-white">
            {JSON.stringify(
              {
                session,
                account,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Home;
