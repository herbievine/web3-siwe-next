import {
  Connector,
  type ConnectorData,
  UserRejectedRequestError,
  type Chain,
} from "wagmi";
import type { RPCProviderModule } from "@magic-sdk/provider/dist/types/modules/rpc-provider";
import type { AbstractProvider } from "web3-core";
import type {
  InstanceWithExtensions,
  SDKBase,
  MagicSDKExtensionsOption,
  MagicSDKAdditionalConfiguration,
} from "@magic-sdk/provider";
import { type CustomNodeConfiguration, Magic } from "magic-sdk";
import { ethers, type Signer, type providers } from "ethers";
import { type Address, normalizeChainId } from "@wagmi/core";

export interface MagicConnectorOptions {
  apiKey: string;
  config?: MagicSDKAdditionalConfiguration<
    string,
    MagicSDKExtensionsOption<string>
  >;
}

export type MagicConnectorProvider = RPCProviderModule & AbstractProvider;

export class MagicConnector extends Connector<
  MagicConnectorProvider,
  MagicConnectorOptions,
  providers.JsonRpcSigner
> {
  readonly id = "magic";
  readonly name = "Magic";
  readonly ready = typeof window !== "undefined";
  readonly sdk!: InstanceWithExtensions<
    SDKBase,
    MagicSDKExtensionsOption<string>
  >;

  #provider?: MagicConnectorProvider;
  #options: MagicConnectorOptions;

  constructor(config: { chains: Chain[]; options: MagicConnectorOptions }) {
    super(config);

    this.#options = config.options;
    if (this.ready)
      this.sdk = new Magic(this.#options.apiKey, this.#options.config);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getProvider() {
    if (!this.#provider) {
      this.#provider = this.sdk.rpcProvider as MagicConnectorProvider;
    }
    return this.#provider;
  }

  async getSigner(): Promise<providers.JsonRpcSigner> {
    const provider = new ethers.providers.Web3Provider(
      (await this.getProvider()) as unknown as providers.ExternalProvider
    );

    return provider.getSigner();
  }

  async getAccount(): Promise<Address> {
    const provider = new ethers.providers.Web3Provider(
      (await this.getProvider()) as unknown as providers.ExternalProvider
    );
    const signer = provider.getSigner();
    const account = await signer.getAddress();

    if (account.startsWith("0x")) return account as Address;

    return `0x${account}`;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getChainId(): Promise<number> {
    const networkOptions = this.#options.config?.network;

    if (typeof networkOptions === "object") {
      const chainId = networkOptions?.chainId;

      if (chainId) {
        return normalizeChainId(chainId);
      }
    }

    throw new Error("Chain ID is not defined");
  }

  async isAuthorized() {
    try {
      return !!(await this.sdk.user.getMetadata());
    } catch {
      return false;
    }
  }

  async connect(): Promise<Required<ConnectorData>> {
    if (!this.sdk.apiKey) throw new Error("Magic API key is missing");

    try {
      const provider = await this.getProvider();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      provider.on("accountsChanged", this.onAccountsChanged);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      provider.on("chainChanged", this.onChainChanged);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      provider.on("disconnect", this.onDisconnect);

      this.emit("message", { type: "connecting" });

      const accounts = await this.sdk.wallet.connectWithUI();
      const chainId = normalizeChainId(await this.getChainId());

      return {
        account: accounts[0] as `0x${string}`,
        chain: {
          id: chainId,
          unsupported: this.isChainUnsupported(chainId),
        },
        provider: this.#provider,
      };
    } catch (error) {
      throw new UserRejectedRequestError(
        "User rejected the request to connect to Magic"
      );
    }
  }

  async disconnect(): Promise<void> {
    await this.sdk.wallet.disconnect();
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
