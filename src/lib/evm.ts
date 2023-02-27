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
import { magicWallet } from "./wallet";
import { env } from "~/env.mjs";

const { chains, provider } = configureChains([optimism], [publicProvider()]);

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
