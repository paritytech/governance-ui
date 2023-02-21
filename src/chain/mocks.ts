export const delegatesMock = [
  {
    account: {
      name: 'hamid',
      address: '128iGaUF4zV1L2bXtAH9UmocvqpSLrJFL5TxZYZkjoSf16Hv',
    },
    roles: ['nominatoe', 'fellow', 'validator'],
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel facilisis augue. Praesent nec imperdiet diam. Etiam tempus convallis sollicitudin. Read more',
    stats: [
      { title: 'Most active track', value: 'Staking admin' },
      { title: 'Participation', value: '75.71%' },
      { title: 'Representing', value: '135 addresses' },
      { title: 'DOT', value: '24k DOT' },
    ],
  },
  {
    account: {
      name: 'hamid',
      address: '128iGaUF4zV1L2bXtAH9UmocvqpSLrJFL5TxZYZkjoSf16Hv',
    },
    roles: ['nominatoe', 'fellow', 'validator'],
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel facilisis augue. Praesent nec imperdiet diam. Etiam tempus convallis sollicitudin. Read more',
    stats: [
      { title: 'Most active track', value: 'Staking admin' },
      { title: 'Participation', value: '75.71%' },
      { title: 'Representing', value: '135 addresses' },
      { title: 'DOT', value: '24k DOT' },
    ],
  },
  {
    account: {
      name: 'hamid',
      address: '128iGaUF4zV1L2bXtAH9UmocvqpSLrJFL5TxZYZkjoSf16Hv',
    },
    roles: ['nominatoe', 'fellow', 'validator'],
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel facilisis augue. Praesent nec imperdiet diam. Etiam tempus convallis sollicitudin. Read more',
    stats: [
      { title: 'Most active track', value: 'Staking admin' },
      { title: 'Participation', value: '75.71%' },
      { title: 'Representing', value: '135 addresses' },
      { title: 'DOT', value: '24k DOT' },
    ],
  },
  {
    account: {
      name: 'hamid',
      address: '128iGaUF4zV1L2bXtAH9UmocvqpSLrJFL5TxZYZkjoSf16Hv',
    },
    roles: ['nominatoe', 'fellow', 'validator'],
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel facilisis augue. Praesent nec imperdiet diam. Etiam tempus convallis sollicitudin. Read more',
    stats: [
      { title: 'Most active track', value: 'Staking admin' },
      { title: 'Participation', value: '75.71%' },
      { title: 'Representing', value: '135 addresses' },
      { title: 'DOT', value: '24k DOT' },
    ],
  },
];

/*
 const tracks = [
  [
    0,
    {
      name: root,
      maxDeciding: 1,
      decisionDeposit: 3333333333300000,
      preparePeriod: 1200,
      decisionPeriod: 201600,
      confirmPeriod: 14400,
      minEnactmentPeriod: 14400,
      minApproval: {
        reciprocal: {
          factor: 222222224,
          xOffset: 333333335,
          yOffset: 333333332,
        },
      },
      minSupport: {
        linearDecreasing: { length: 1000000000, floor: 0, ceil: 500000000 },
      },
    },
  ],
  [
    1,
    {
      name: whitelisted_caller,
      maxDeciding: 100,
      decisionDeposit: 333333333330000,
      preparePeriod: 300,
      decisionPeriod: 201600,
      confirmPeriod: 100,
      minEnactmentPeriod: 100,
      minApproval: {
        reciprocal: {
          factor: 270899180,
          xOffset: 389830523,
          yOffset: 305084738,
        },
      },
      minSupport: {
        reciprocal: { factor: 8650766, xOffset: 18867926, yOffset: 41509433 },
      },
    },
  ],
  [
    10,
    {
      name: staking_admin,
      maxDeciding: 10,
      decisionDeposit: 166666666665000,
      preparePeriod: 1200,
      decisionPeriod: 201600,
      confirmPeriod: 1800,
      minEnactmentPeriod: 100,
      minApproval: {
        linearDecreasing: {
          length: 607142857,
          floor: 500000000,
          ceil: 1000000000,
        },
      },
      minSupport: {
        reciprocal: { factor: 7892829, xOffset: 15544040, yOffset: -7772020 },
      },
    },
  ],
  [
    11,
    {
      name: treasurer,
      maxDeciding: 10,
      decisionDeposit: 33333333333000,
      preparePeriod: 1200,
      decisionPeriod: 201600,
      confirmPeriod: 1800,
      minEnactmentPeriod: 14400,
      minApproval: {
        reciprocal: {
          factor: 222222224,
          xOffset: 333333335,
          yOffset: 333333332,
        },
      },
      minSupport: {
        linearDecreasing: { length: 1000000000, floor: 0, ceil: 500000000 },
      },
    },
  ],
  [
    12,
    {
      name: lease_admin,
      maxDeciding: 10,
      decisionDeposit: 166666666665000,
      preparePeriod: 1200,
      decisionPeriod: 201600,
      confirmPeriod: 1800,
      minEnactmentPeriod: 100,
      minApproval: {
        linearDecreasing: {
          length: 607142857,
          floor: 500000000,
          ceil: 1000000000,
        },
      },
      minSupport: {
        reciprocal: { factor: 7892829, xOffset: 15544040, yOffset: -7772020 },
      },
    },
  ],
  [
    13,
    {
      name: fellowship_admin,
      maxDeciding: 10,
      decisionDeposit: 166666666665000,
      preparePeriod: 1200,
      decisionPeriod: 201600,
      confirmPeriod: 1800,
      minEnactmentPeriod: 100,
      minApproval: {
        linearDecreasing: {
          length: 607142857,
          floor: 500000000,
          ceil: 1000000000,
        },
      },
      minSupport: {
        reciprocal: { factor: 7892829, xOffset: 15544040, yOffset: -7772020 },
      },
    },
  ],
  [
    14,
    {
      name: general_admin,
      maxDeciding: 10,
      decisionDeposit: 166666666665000,
      preparePeriod: 1200,
      decisionPeriod: 201600,
      confirmPeriod: 1800,
      minEnactmentPeriod: 100,
      minApproval: {
        reciprocal: {
          factor: 222222224,
          xOffset: 333333335,
          yOffset: 333333332,
        },
      },
      minSupport: {
        reciprocal: { factor: 49586777, xOffset: 90909091, yOffset: -45454546 },
      },
    },
  ],
  [
    15,
    {
      name: auction_admin,
      maxDeciding: 10,
      decisionDeposit: 166666666665000,
      preparePeriod: 1200,
      decisionPeriod: 201600,
      confirmPeriod: 1800,
      minEnactmentPeriod: 100,
      minApproval: {
        reciprocal: {
          factor: 222222224,
          xOffset: 333333335,
          yOffset: 333333332,
        },
      },
      minSupport: {
        reciprocal: { factor: 49586777, xOffset: 90909091, yOffset: -45454546 },
      },
    },
  ],
  [
    20,
    {
      name: referendum_canceller,
      maxDeciding: 1000,
      decisionDeposit: 333333333330000,
      preparePeriod: 1200,
      decisionPeriod: 100800,
      confirmPeriod: 1800,
      minEnactmentPeriod: 100,
      minApproval: {
        linearDecreasing: {
          length: 607142857,
          floor: 500000000,
          ceil: 1000000000,
        },
      },
      minSupport: {
        reciprocal: { factor: 7892829, xOffset: 15544040, yOffset: -7772020 },
      },
    },
  ],
  [
    21,
    {
      name: referendum_killer,
      maxDeciding: 1000,
      decisionDeposit: 1666666666650000,
      preparePeriod: 1200,
      decisionPeriod: 201600,
      confirmPeriod: 1800,
      minEnactmentPeriod: 100,
      minApproval: {
        linearDecreasing: {
          length: 607142857,
          floor: 500000000,
          ceil: 1000000000,
        },
      },
      minSupport: {
        reciprocal: { factor: 7892829, xOffset: 15544040, yOffset: -7772020 },
      },
    },
  ],
  [
    30,
    {
      name: small_tipper,
      maxDeciding: 200,
      decisionDeposit: 33333333333,
      preparePeriod: 10,
      decisionPeriod: 100800,
      confirmPeriod: 100,
      minEnactmentPeriod: 10,
      minApproval: {
        linearDecreasing: {
          length: 357142857,
          floor: 500000000,
          ceil: 1000000000,
        },
      },
      minSupport: {
        reciprocal: { factor: 1620729, xOffset: 3231018, yOffset: -1615509 },
      },
    },
  ],
  [
    31,
    {
      name: big_tipper,
      maxDeciding: 100,
      decisionDeposit: 333333333330,
      preparePeriod: 100,
      decisionPeriod: 100800,
      confirmPeriod: 600,
      minEnactmentPeriod: 100,
      minApproval: {
        linearDecreasing: {
          length: 357142857,
          floor: 500000000,
          ceil: 1000000000,
        },
      },
      minSupport: {
        reciprocal: { factor: 4149097, xOffset: 8230453, yOffset: -4115227 },
      },
    },
  ],
  [
    32,
    {
      name: small_spender,
      maxDeciding: 50,
      decisionDeposit: 3333333333300,
      preparePeriod: 2400,
      decisionPeriod: 201600,
      confirmPeriod: 7200,
      minEnactmentPeriod: 14400,
      minApproval: {
        linearDecreasing: {
          length: 607142857,
          floor: 500000000,
          ceil: 1000000000,
        },
      },
      minSupport: {
        reciprocal: { factor: 7892829, xOffset: 15544040, yOffset: -7772020 },
      },
    },
  ],
  [
    33,
    {
      name: medium_spender,
      maxDeciding: 50,
      decisionDeposit: 6666666666600,
      preparePeriod: 2400,
      decisionPeriod: 201600,
      confirmPeriod: 14400,
      minEnactmentPeriod: 14400,
      minApproval: {
        linearDecreasing: {
          length: 821428571,
          floor: 500000000,
          ceil: 1000000000,
        },
      },
      minSupport: {
        reciprocal: { factor: 14377233, xOffset: 27972031, yOffset: -13986016 },
      },
    },
  ],
  [
    34,
    {
      name: big_spender,
      maxDeciding: 50,
      decisionDeposit: 13333333333200,
      preparePeriod: 2400,
      decisionPeriod: 201600,
      confirmPeriod: 28800,
      minEnactmentPeriod: 14400,
      minApproval: {
        linearDecreasing: {
          length: 1000000000,
          floor: 500000000,
          ceil: 1000000000,
        },
      },
      minSupport: {
        reciprocal: { factor: 28326977, xOffset: 53763445, yOffset: -26881723 },
      },
    },
  ],
];
*/

export const tracksMetadata = [
  {
    title: 'Admin',
    subtracks: [
      {
        id: 0,
        title: 'Root',
        description: 'Root is the track for the most important things',
      },
      {
        id: 15,
        title: 'Auction Admin',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis dui vitae leo aliquam iaculis. Maecenas faucibus nisi id lacus lacinia ornare. Phasellus in eros dignissim',
      },
      {
        id: 10,
        title: 'Staking Admin',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis dui vitae leo aliquam iaculis. Maecenas faucibus nisi id lacus lacinia ornare. Phasellus in eros dignissim',
      },
    ],
  },
  {
    title: 'Governance',
    subtracks: [
      {
        id: 12,
        title: 'Lease Admin',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      },
      {
        id: 14,
        title: 'General Admin',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 20,
        title: 'Referendum Canceler',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 21,
        title: 'Referendum Killer',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 10,
        title: 'Staking Admin',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
    ],
  },
  {
    title: 'Treasury',
    subtracks: [
      {
        id: 30,
        title: 'Small Tipper',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 31,
        title: 'Big Tipper',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 32,
        title: 'Small Spender',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 33,
        title: 'Medium Spender',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 34,
        title: 'Big Spender',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 11,
        title: 'Treasurer',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
    ],
  },
  {
    title: 'Fellowship',
    subtracks: [
      {
        id: 1,
        title: 'Whitelisted Caller',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 13,
        title: 'Fellowship Admin',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
    ],
  },
];
