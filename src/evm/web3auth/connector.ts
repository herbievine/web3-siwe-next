import {
  Connector,
  type ConnectorData,
  UserRejectedRequestError,
  type Chain,
} from "wagmi";
import { type CustomNodeConfiguration, Magic } from "magic-sdk";
import ethers, { type Signer, type providers } from "ethers";
import { type Address, normalizeChainId } from "@wagmi/core";
import { type Web3Auth } from "@web3auth/modal";
import type { SafeEventEmitterProvider } from "@web3auth/base/dist/types/provider/IProvider";

export interface Web3AuthConnectorOptions {
  chains: Chain[];
  options: {
    client: Web3Auth;
    plugins?: Parameters<Web3Auth["addPlugin"]>[0][];
    adapters?: Parameters<Web3Auth["configureAdapter"]>[0][];
  };
}

export class Web3AuthConnector extends Connector<
  SafeEventEmitterProvider,
  Web3AuthConnectorOptions["options"],
  providers.JsonRpcSigner
> {
  readonly id = "web3auth";
  readonly name = "Web3Auth";
  readonly ready = typeof window !== "undefined";

  #provider?: SafeEventEmitterProvider;
  #client!: Web3Auth;
  #plugins?: Parameters<Web3Auth["addPlugin"]>[0][];
  #adapters?: Parameters<Web3Auth["configureAdapter"]>[0][];

  constructor(config: Web3AuthConnectorOptions) {
    super(config);

    if (this.ready) {
      this.#client = config.options.client;
      this.#plugins = config.options.plugins;
      this.#adapters = config.options.adapters;
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getProvider() {
    console.log("getProvider");
    if (!this.#provider) {
      this.#provider = this.#client.provider!;
    }
    return this.#provider;
  }

  async getSigner(): Promise<providers.JsonRpcSigner> {
    console.log("getSigner");
    const provider = new ethers.providers.Web3Provider(
      await this.getProvider()
    );

    return provider.getSigner();
  }

  async getAccount(): Promise<Address> {
    console.log("getAccount");
    const provider = new ethers.providers.Web3Provider(
      await this.getProvider()
    );
    console.log("provider getAccount", provider);

    const signer = provider.getSigner();
    const account = await signer.getAddress();

    if (account.startsWith("0x")) return account as Address;

    return `0x${account}`;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getChainId(): Promise<number> {
    console.log("getChainId");
    const chainId = this.#client.coreOptions.clientId;

    return normalizeChainId(chainId);
  }

  async isAuthorized() {
    console.log("isAuthorized");
    try {
      return !!(await this.#client.getUserInfo());
    } catch {
      return false;
    }
  }

  async connect(): Promise<Required<ConnectorData>> {
    console.log("connect");

    if (this.#client.status === "not_ready") {
      if (this.#plugins) {
        for (const plugin of this.#plugins) {
          await this.#client.addPlugin(plugin);
        }
      }

      if (this.#adapters) {
        for (const adapter of this.#adapters) {
          this.#client.configureAdapter(adapter);
        }
      }

      await this.#client.initModal();
    }

    try {
      const provider = await this.#client.connect();

      if (!provider) throw new Error("No provider found");

      this.#provider = provider;

      console.log(
        "request",
        await provider.request({ method: "eth_accounts" })
      );

      const tmp = new ethers.providers.Web3Provider(provider);
      const signer = tmp.getSigner();
      const account = await signer.getAddress();

      console.log("conected", {
        account: account,
        // chain: {
        //   id: await this.getChainId(),
        //   unsupported: this.isChainUnsupported(await this.getChainId()),
        // },
      });

      console.log("here");

      // eslint-disable-next-line @typescript-eslint/unbound-method
      provider.on("accountsChanged", this.onAccountsChanged);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      provider.on("chainChanged", this.onChainChanged);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      provider.on("disconnect", this.onDisconnect);

      this.emit("message", { type: "connecting" });

      const chainId = normalizeChainId(await this.getChainId());

      return {
        account: await this.getAccount(),
        chain: {
          id: chainId,
          unsupported: this.isChainUnsupported(chainId),
        },
        provider: this.#provider,
      };
    } catch (error) {
      console.error(error);

      throw new UserRejectedRequestError(
        "User rejected the request to connect to Magic"
      );
    }
  }

  async disconnect(): Promise<void> {
    console.log("disconnect");
    await this.#client.logout();
  }

  protected onDisconnect(): void {
    this.emit("disconnect");
  }

  protected onAccountsChanged(accounts: `0x${string}`[]): void {
    if (accounts.length === 0) this.emit("disconnect");
    else this.emit("change", { account: accounts[0] });
  }

  protected onChainChanged(chainId: string | number): void {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);

    this.emit("change", { chain: { id, unsupported } });
  }
}
