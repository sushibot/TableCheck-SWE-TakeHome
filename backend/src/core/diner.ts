export const DINER = {
  MAX_SEATS: 10,
  AVAILABLE_SEATS: 0,
};

export interface Diner {
  partyName: string;
  size: number;
  timestamp: number;
}
