export type StatType = { title: string; value: string };
export type DelegateRoleType = 'nominator' | 'validator' | 'fellow';
export type DelegateAccountType = {
  name: string;
  address: string;
};
export type DelegateType = {
  account: DelegateAccountType;
  roles: DelegateRoleType[];
  bio: string;
  stats: StatType[];
};

export type TrackType = {
  id: number;
  title: string;
  description: string;
};

export type TrackCategoryType = {
  title: string;
  subtracks: TrackType[];
};
