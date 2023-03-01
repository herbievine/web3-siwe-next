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
import { magicWallet } from "./magic/wallet";
import { env } from "~/env.mjs";
import { web3AuthWallet } from "./web3auth/wallet";
import { torusPlugin, torusWalletAdapter, web3Auth } from "./web3auth/client";

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
      web3AuthWallet({
        chains,
        options: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          client: web3Auth,
          // plugins: [torusPlugin],
          adapters: [torusWalletAdapter],
        },
      }),
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
