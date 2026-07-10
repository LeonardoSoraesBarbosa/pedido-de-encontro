export enum AppStep {
  PROPOSAL = 'PROPOSAL',
  CLICKED_WRONG = 'CLICKED_WRONG',
  CALENDAR = 'CALENDAR',
  CONFIRMED = 'CONFIRMED'
}

export interface DateDetails {
  date: string; // ISO String or YYYY-MM-DD
  timeSlot: string;
  notes: string;
  clickedNoFirst: boolean;
  noAttempts: number;
}

export interface TimeOption {
  id: string;
  time: string;
  label: string;
  emoji: string;
}
