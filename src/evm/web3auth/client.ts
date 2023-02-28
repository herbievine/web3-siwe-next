import { Web3Auth } from "@web3auth/modal";
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";
import { optimism } from "@wagmi/chains";
import { env } from "~/env.mjs";

export const web3Auth = (typeof window !== "undefined" &&
  new Web3Auth({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    clientId: env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
    chainConfig: {
      chainNamespace: "eip155",
      chainId: "0x" + optimism.id.toString(16),
    },
    uiConfig: {
      loginMethodsOrder: ["facebook", "google"],
      modalZIndex: "2147483647",
    },
  })) as unknown as Web3Auth;

export const torusPlugin = new TorusWalletConnectorPlugin({
  torusWalletOpts: {},
  walletInitOptions: {
    whiteLabel: {
      theme: { isDark: true, colors: { primary: "#00a8ff" } },
      logoDark: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
      logoLight: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
    },
    useWalletConnect: true,
    enableLogging: true,
  },
});
