import { WsProvider } from '@polkadot/api';

type Stats = {
  bytesRecv: number;
  errors: number;
  timeout: number;
  stallCount: number;
};

export class WsReconnectProvider extends WsProvider {
  static RETRY_DELAY = 2_500;
  static CHECKER_INTERVAL_MS = 5_000;
  static PER_REQUEST_TIMEOUT_MS = 15_000;
  static MAX_STALL_COUNT = 5;
  statsHistory = new Map<string, Stats>();

  #checkerId: ReturnType<typeof setTimeout> | undefined; // Workaround typescript limitation, see https://stackoverflow.com/a/56239226

  constructor(endpoints: string[]) {
    super(
      endpoints,
      WsReconnectProvider.RETRY_DELAY,
      undefined,
      WsReconnectProvider.PER_REQUEST_TIMEOUT_MS
    );

    this.#checkerId = setInterval(
      this.#checker.bind(this),
      WsReconnectProvider.CHECKER_INTERVAL_MS
    );

    // Triggered by connect, disconnect or onSocketError
    super.on('error', (e) => {
      console.debug(`Received error; disonnect from ${this.endpoint}`, e);

      super.disconnect.apply(this);
    });
    super.on('connected', () => {
      console.debug(`Connected to ${this.endpoint}`);
    });
    super.on('disconnected', () => {
      console.debug(`Disonnected from  ${this.endpoint}`);
    });
  }

  #checker() {
    try {
      if (!super.isConnected) {
        console.debug(`Not connected, connect to ${this.endpoint}`);
        super.connect();
      }
    } catch (e) {
      console.debug('Failed to connect', e);
    }

    const { bytesRecv, errors, timeout } = super.stats.total;
    const previousStats = this.statsHistory.get(super.endpoint);
    const stalled = previousStats?.bytesRecv == bytesRecv;
    const newStallCount = stalled ? (previousStats?.stallCount || 0) + 1 : 0;

    this.statsHistory.set(super.endpoint, {
      bytesRecv,
      errors,
      timeout,
      stallCount: newStallCount,
    });

    if (newStallCount > WsReconnectProvider.MAX_STALL_COUNT) {
      console.debug('No progress, connection is stalled. Disconnect');
      this.statsHistory.delete(super.endpoint); // Clear existing stats
      super.disconnect();
    }
  }

  #clearCheckId() {
    if (this.#checkerId) {
      clearInterval(this.#checkerId);
      this.#checkerId = undefined;
    }
  }

  close() {
    this.#clearCheckId();
  }
}
