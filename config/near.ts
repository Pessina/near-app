import { Near, connect, keyStores } from "near-api-js";

class NearConnection {
  connection: Near | undefined;
  config = {
    networkId: "testnet",
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://app.mynearwallet.com/",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
  };

  async createConnection() {
    this.connection = await connect(this.config);
  }

  isConnected(): this is { connection: Near } {
    return this.connection !== undefined;
  }

  getConnection(): Near | undefined {
    return this.connection;
  }
}

const nearConnection = new NearConnection();

export default nearConnection;
