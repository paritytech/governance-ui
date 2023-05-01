import { WsProvider } from '@polkadot/api';

/*type Snapshot = {
  date: number;
  bytesRecv: number;
  errors: number;
  timeout: number;
};*/

export class WsReconnectProvider extends WsProvider {
  static CHECKER_INTERVAL_MS = 5_000;
  static PER_REQUEST_TIMEOUT_MS = 15_000;

  #checkerId: ReturnType<typeof setTimeout> | undefined; // Workaround typescript limitation, see https://stackoverflow.com/a/56239226

  constructor(endpoints: string[]) {
    super(
      endpoints,
      false,
      undefined,
      WsReconnectProvider.PER_REQUEST_TIMEOUT_MS
    );

    this.connect();

    this.on('disconnected', this.reconnect.bind(this));
    this.on('error', this.reconnect.bind(this));
  }

  // Called by super.connect()
  /*protected selectEndpointIndex(endpoints: string[]): number {
    
  }*/

  async reconnect() {
    await this.disconnect();
    await this.connect();
  }

  #checker() {
    const { bytesRecv, errors, timeout } = this.stats.total;
    console.debug('CHECKING', this.endpoint, bytesRecv, errors, timeout);
  }

  async connect(): Promise<void> {
    const result = super.connect();

    this.#checkerId = setInterval(
      this.#checker.bind(this),
      WsReconnectProvider.CHECKER_INTERVAL_MS
    );

    await result;
  }

  async disconnect(): Promise<void> {
    clearInterval(this.#checkerId);
    this.#checkerId = undefined;

    await super.disconnect();
  }
}
