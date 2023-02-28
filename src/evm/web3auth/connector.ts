import {
  Connector,
  type ConnectorData,
  UserRejectedRequestError,
  type Chain,
} from "wagmi";
import { type CustomNodeConfiguration, Magic } from "magic-sdk";
import ethers, { type Signer, type providers } from "ethers";
import { type Address, normalizeChainId } from "@wagmi/core";
import { Web3Auth, type Web3AuthOptions } from "@web3auth/modal";
import type { SafeEventEmitterProvider } from "@web3auth/base/dist/types/provider/IProvider";

export class Web3AuthConnector extends Connector<
  SafeEventEmitterProvider,
  Web3AuthOptions,
  providers.JsonRpcSigner
> {
  readonly id = "web3auth";
  readonly name = "Web3Auth";
  readonly ready = typeof window !== "undefined";
  readonly sdk!: Web3Auth;

  #provider?: SafeEventEmitterProvider;
  #options: Web3AuthOptions;

  constructor(config: { chains: Chain[]; options: Web3AuthOptions }) {
    super(config);

    this.#options = config.options;
    if (this.ready) this.sdk = new Web3Auth(this.#options);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getProvider() {
    if (!this.#provider) {
      this.#provider = this.sdk.provider!;
    }
    return this.#provider;
  }

  async getSigner(): Promise<providers.JsonRpcSigner> {
    const provider = new ethers.providers.Web3Provider(
      await this.getProvider()
    );

    return provider.getSigner();
  }

  async getAccount(): Promise<Address> {
    const provider = new ethers.providers.Web3Provider(
      await this.getProvider()
    );
    const signer = provider.getSigner();
    const account = await signer.getAddress();

    if (account.startsWith("0x")) return account as Address;

    return `0x${account}`;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getChainId(): Promise<number> {
    const chainId = this.#options.chainConfig.chainId ?? "0x1";

    return normalizeChainId(chainId);
  }

  async isAuthorized() {
    try {
      return !!(await this.sdk.getUserInfo());
    } catch {
      return false;
    }
  }

  async connect(): Promise<Required<ConnectorData>> {
    if (this.sdk.status === "not_ready") {
      await this.sdk.init();
      await this.sdk.initModal();
    }

    try {
      // await this.sdk.connect();
      const provider = await this.getProvider();

      if (!provider) throw new Error("No provider found");

      // eslint-disable-next-line @typescript-eslint/unbound-method
      provider.on("accountsChanged", this.onAccountsChanged);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      provider.on("chainChanged", this.onChainChanged);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      provider.on("disconnect", this.onDisconnect);

      this.emit("message", { type: "connecting" });

      await this.sdk.connect();
      const chainId = normalizeChainId(await this.getChainId());

      return {
        account: "0xE2b8a1e1696c8d5Bb4F7922d7bA4B657b5e5d60b",
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
    await this.sdk.logout();
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
