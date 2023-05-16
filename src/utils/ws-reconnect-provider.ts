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
    super.on('error', super.disconnect.bind(this));
  }

  #checker() {
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

    try {
      if (!super.isConnected) {
        super.connect();
      }
    } catch {
      // Ignore
    }

    if (newStallCount > 5) {
      console.debug('No progress, connection is stalled. Force reconnection');
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
