import { Web3Auth } from "@web3auth/modal";
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";
import { polygonMumbai } from "@wagmi/chains";
import { env } from "~/env.mjs";
import { TorusWalletAdapter } from "@web3auth/torus-evm-adapter";

export const web3Auth = (typeof window !== "undefined" &&
  new Web3Auth({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    clientId: env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
    chainConfig: {
      chainNamespace: "eip155",
      chainId: "0x" + polygonMumbai.id.toString(16),
    },
    uiConfig: {
      loginMethodsOrder: ["facebook", "google"],
      modalZIndex: "2147483647",
    },
  })) as unknown as Web3Auth;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const torusWalletAdapter = new TorusWalletAdapter({
  adapterSettings: {
    buttonPosition: "bottom-left",
  },
  loginSettings: {
    verifier: "google",
  },
  initParams: {
    buildEnv: "testing",
  },
  // @ts-ignore
  chainConfig: {
    chainNamespace: "eip155",
    chainId: "0x" + polygonMumbai.id.toString(16),
  },
  clientId: env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
  sessionTime: 60 * 60 * 24 * 7,
  web3AuthNetwork: "cyan",
}) as unknown as Parameters<Web3Auth["configureAdapter"]>[0];

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
