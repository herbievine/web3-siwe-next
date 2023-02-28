import type { Wallet } from "@rainbow-me/rainbowkit";
import type { Chain, Connector } from "wagmi";
import { MagicConnector, type MagicConnectorOptions } from "./connector";

export interface MagicWalletOptions {
  chains: Chain[];
  options: MagicConnectorOptions;
}

export const magicWallet = (opts: MagicWalletOptions): Wallet<Connector> => ({
  id: "magic",
  name: "Magic",
  iconUrl: "https://svgshare.com/i/iJK.svg",
  iconBackground: "#ffffff",
  installed: typeof window !== "undefined",
  createConnector() {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      connector: new MagicConnector(opts),
    };
  },
});
