import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { configureChains, createClient } from "wagmi";
import { optimism } from "wagmi/chains";
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
import { torusPlugin, web3Auth } from "./web3auth/client";

const { chains, provider } = configureChains([optimism], [publicProvider()]);

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
          plugins: [torusPlugin],
        },
      }),
      magicWallet({
        chains,
        options: {
          apiKey: env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY,
          config: {
            network: {
              chainId: optimism.id,
              rpcUrl: "https://mainnet.optimism.io",
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
