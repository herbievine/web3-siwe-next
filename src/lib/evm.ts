import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { configureChains, createClient } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { magicWallet } from "./wallet";
import { env } from "~/env.mjs";

const { chains, provider } = configureChains(
  [polygonMumbai],
  [publicProvider()]
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet({ chains }),
      rainbowWallet({ chains }),
      walletConnectWallet({ chains }),
      ledgerWallet({ chains }),
      magicWallet({
        chains,
        options: {
          apiKey: env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY,
          config: {
            network: {
              chainId: polygonMumbai.id,
              rpcUrl: "https://rpc-mumbai.maticvigil.com/",
            },
          },
        },
      }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export { wagmiClient, chains };
