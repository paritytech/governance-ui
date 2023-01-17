import { WsProvider } from '@polkadot/api';

export class WsReconnectProvider extends WsProvider {
  static CHECKER_INTERVAL = 5_000; // in ms

  #checkerId: ReturnType<typeof setTimeout> | undefined; // Workaround typescript limitation, see https://stackoverflow.com/a/56239226

  constructor(endpoints: string[]) {
    super(endpoints, false, undefined, 5_000);
    // timeout: how long to wait per request before an error is sent back
    // Checked every TIMEOUT_INTERVAL = 5_000

    // WsProvider tries to reconnect every RETRY_DELAY=2_500 when onSocketClose is called

    // events: connected, disconnected, error

    // Spawn a setInterval that monitors stats

    // Remove from endpoints RPC that looks stalled or dead

    this.connect();
    this.on('disconnected', () => console.log('DISCONNECTED'));
    this.on('error', () => console.log('ERROR'));
  }

  async reconnect() {
    await this.disconnect();
    await this.reconnect();
  }

  // TODO manually handle connect, retry
  // detect stall: no new heads? no ws message? this.#stats.total.bytesRecv not moving?
  // when reconnect: change endpoint?
  // can disconnect manually
  // Rely on stats

  get #currentEndpoint() {
    const endpoints = this['__private_14_endpoints'] as string[];
    const endpointIndex: number = this['__private_22_endpointIndex'] as number;
    return endpoints[endpointIndex];
  }

  #checker() {
    const { bytesRecv, errors, timeout } = this.stats.total;
    console.log('CHECKING', this.#currentEndpoint, bytesRecv, errors, timeout);
  }

  async connect(): Promise<void> {
    const result = super.connect();

    this.#checkerId = setInterval(
      this.#checker.bind(this),
      WsReconnectProvider.CHECKER_INTERVAL
    );

    await result;
  }

  async disconnect(): Promise<void> {
    clearInterval(this.#checkerId);
    this.#checkerId = undefined;

    await super.disconnect();
  }
}

// https://github.com/joewalnes/reconnecting-websocket/blob/master/reconnecting-websocket.js
// https://stackoverflow.com/questions/13797262/how-to-reconnect-to-websocket-after-close-connection
// https://stackoverflow.com/questions/3780511/reconnection-of-client-when-server-reboots-in-websocket
// https://github.com/pladaria/reconnecting-websocket/blob/master/reconnecting-websocket.ts
