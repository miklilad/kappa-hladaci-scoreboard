export const GAMES = ["sreality", "bazos", "geoguessr"] as const;

export type Game = (typeof GAMES)[number];

export const GAME_INFO: Record<
  Game,
  { label: string; higherIsBetter: boolean }
> = {
  sreality: { label: "Sreality", higherIsBetter: true },
  bazos: { label: "Bazoš", higherIsBetter: true },
  geoguessr: { label: "GeoGuessr", higherIsBetter: true },
};

export type IsoDate = `${number}-${number}-${number}`;

/** One day of play. Each game's scores are indexed the same as `players`. */
export type Session = {
  date: IsoDate;
  players: string[];
} & Record<Game, number[]>;

export const scores: Session[] = [
  {
    date: "2026-09-18",
    players: ["Lada", "Honza", "Jenda"],
    sreality: [1564, 2246, 38484],
    bazos: [1111, 2222, 3333],
    geoguessr: [1564, 2246, 38484],
  },
  {
    date: "2026-09-19",
    players: ["Lada", "Honza", "Jenda"],
    sreality: [1564, 2246, 38484],
    bazos: [4444, 2222, 3333],
    geoguessr: [1564, 2246, 38484],
  },
  {
    date: "2026-09-20",
    players: ["Lada", "Honza", "Jenda", "Test"],
    sreality: [1564, 2246, 38484, 4444],
    bazos: [4444, 2222, 3333, 4444],
    geoguessr: [1564, 2246, 38484, 4444],
  },
];
