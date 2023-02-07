import { WsProvider } from '@polkadot/api';

export class WsReconnectProvider extends WsProvider {
  static CHECKER_INTERVAL_MS = 5_000;
  static PER_REQUEST_TIMEOUT_MS = 5_000;

  #checkerId: ReturnType<typeof setTimeout> | undefined; // Workaround typescript limitation, see https://stackoverflow.com/a/56239226

  constructor(endpoints: string[]) {
    super(
      endpoints,
      false,
      undefined,
      WsReconnectProvider.PER_REQUEST_TIMEOUT_MS
    );

    this.connect();
    this.on('disconnected', () => console.log('DISCONNECTED'));
    this.on('error', () => console.log('ERROR'));
  }

  async reconnect() {
    await this.disconnect();
    await this.connect();
  }

  // TODO manually handle connect, retry
  // detect stall: no new heads? no ws message? this.#stats.total.bytesRecv not moving?
  // when reconnect: change endpoint?
  // can disconnect manually
  // Rely on stats

  get #currentEndpoint() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const endpoints = this['__private_14_endpoints'] as string[];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const endpointIndex: number = this['__private_22_endpointIndex'] as number;
    return endpoints[endpointIndex];
  }

  #checker() {
    const { bytesRecv, errors, timeout } = this.stats.total;
    console.debug(
      'CHECKING',
      this.#currentEndpoint,
      bytesRecv,
      errors,
      timeout
    );
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

// https://github.com/joewalnes/reconnecting-websocket/blob/master/reconnecting-websocket.js
// https://stackoverflow.com/questions/13797262/how-to-reconnect-to-websocket-after-close-connection
// https://stackoverflow.com/questions/3780511/reconnection-of-client-when-server-reboots-in-websocket
// https://github.com/pladaria/reconnecting-websocket/blob/master/reconnecting-websocket.ts

// TODO rotate URL based on those:
// https://paritytech.github.io/polkadot_network_directory/chains.json
// https://paritytech.github.io/polkadot_network_directory/registry.json

// https://github.com/Skepfyr/little-loadshedder
