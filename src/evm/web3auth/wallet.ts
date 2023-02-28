import type { Wallet } from "@rainbow-me/rainbowkit";
import type { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import type { Chain, Connector } from "wagmi";
import { Web3AuthConnector, type Web3AuthConnectorOptions } from "./connector";

export const web3AuthWallet = (
  opts: Web3AuthConnectorOptions
): Wallet<Connector> => ({
  id: "web3auth",
  name: "Web3Auth",
  iconUrl: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
  iconBackground: "#ffffff",
  installed: typeof window !== "undefined",
  createConnector() {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      connector: new Web3AuthConnector(opts),
    };
  },
});
