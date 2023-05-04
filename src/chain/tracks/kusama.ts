import { BN } from '@polkadot/util';
import { formatBalance } from '@polkadot/util';

interface FormatOptions {
  decimals: number;
  forceUnit: '-';
  withSi: true;
  withUnit: string;
}

export function formatSpendFactory(
  options: FormatOptions
): (mul: number, value: BN) => string {
  return (mul: number, value: BN): string => {
    // We lose the decimals here... depending on chain config, this could be non-optimal
    // (A simple formatBalance(value.muln(mul), FMT_OPTS) formats to 4 decimals)
    return `${formatBalance(value.muln(mul), options).split('.')[0]} ${
      options.withUnit
    }`;
  };
}
// hardcoded here since this is static (hopefully no re-denomination anytime...)
const formatSpend = formatSpendFactory({
  decimals: 12,
  forceUnit: '-',
  withSi: true,
  withUnit: 'KSM',
});

// https://github.com/paritytech/polkadot/blob/6e3f2c5b4b6e6927915de2f784e1d831717760fa/runtime/kusama/constants/src/lib.rs#L28-L32
const UNITS = new BN(1_000_000_000_000);
const QUID = UNITS.divn(30);
const GRAND = QUID.muln(1_000);

// https://github.com/paritytech/polkadot/blob/6e3f2c5b4b6e6927915de2f784e1d831717760fa/runtime/kusama/src/governance/origins.rs#L170-L179
const SPEND_LIMITS = {
  BigSpender: formatSpend(1_000, GRAND),
  BigTipper: formatSpend(1, GRAND),
  MediumSpender: formatSpend(100, GRAND),
  SmallSpender: formatSpend(10, GRAND),
  SmallTipper: formatSpend(250, QUID),
  Treasurer: formatSpend(10_000, GRAND),
};

export const tracks = [
  {
    title: 'Admin',
    tracks: [
      {
        id: 0,
        title: 'Root',
        description: 'Origin for upgrades, fixes, and network rescues',
      },
      {
        id: 15,
        title: 'Auction Admin',
        description: 'Origin for starting auctions',
      },
    ],
  },
  {
    title: 'Governance',
    tracks: [
      {
        id: 12,
        title: 'Lease Admin',
        description: 'Origin able to force slot leases',
      },
      {
        id: 14,
        title: 'General Admin',
        description: 'Origin for managing the registrar',
      },
      {
        id: 20,
        title: 'Referendum Canceler',
        description: 'Origin able to cancel referenda',
      },
      {
        id: 21,
        title: 'Referendum Killer',
        description: 'Origin able to kill referenda',
      },
      {
        id: 10,
        title: 'Staking Admin',
        description: 'Origin for canceling slashes',
      },
    ],
  },
  {
    title: 'Treasury',
    tracks: [
      {
        id: 30,
        title: 'Small Tipper',
        description: `Origin able to spend up to ${SPEND_LIMITS.SmallTipper} from the treasury at once`,
      },
      {
        id: 31,
        title: 'Big Tipper',
        description: `Origin able to spend up to ${SPEND_LIMITS.BigTipper} from the treasury at once`,
      },
      {
        id: 32,
        title: 'Small Spender',
        description: `Origin able to spend up to ${SPEND_LIMITS.SmallSpender} from the treasury at once`,
      },
      {
        id: 33,
        title: 'Medium Spender',
        description: `Origin able to spend up to ${SPEND_LIMITS.MediumSpender} from the treasury at once`,
      },
      {
        id: 34,
        title: 'Big Spender',
        description: `Origin able to spend up to ${SPEND_LIMITS.BigSpender} from the treasury at once`,
      },
      {
        id: 11,
        title: 'Treasurer',
        description: `Origin for spending (any amount of) funds until the upper limit of ${SPEND_LIMITS.Treasurer}`,
      },
    ],
  },
  {
    title: 'Fellowship',
    tracks: [
      {
        id: 1,
        title: 'Whitelisted Caller',
        description: 'Origin commanded by members of the Kusama Fellowship',
      },
      {
        id: 13,
        title: 'Fellowship Admin',
        description: 'Origin for managing the composition of the fellowship',
      },
    ],
  },
];
