export type StatType = { title: string; value: string };
export type DelegateAccountType = {
  name: string;
  address: string;
};

export type TrackType = {
  id: number;
  title: string;
  description: string;
};

export type TrackCategoryType = {
  title: string;
  tracks: TrackType[];
};
