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
          clientId:
            "BI-HhZ0GNQ2gOY8OON282ndfKxeRU_CKmpZoNtOeClliM2sZ88ZBQpkXf5Ba_h38t4Tzg1rJ00PpxSFIR1iZ5FA",
          chainConfig: {
            chainNamespace: "eip155",
            chainId: "0x" + optimism.id.toString(16),
          },
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
