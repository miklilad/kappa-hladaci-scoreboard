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
    players: ["Laďa", "Honza", "Jenda"],
    sreality: [2659, 2123, 1685],
    bazos: [1318, 962, 1088],
    geoguessr: [12935, 17893, 10164],
  },
  {
    date: "2026-09-19",
    players: ["Laďa", "Honza", "Jenda"],
    sreality: [3511, 3139, 1767],
    bazos: [2456, 3059, 2987],
    geoguessr: [17304, 18046, 17921],
  },
  {
    date: "2026-09-20",
    players: ["Laďa", "Honza", "Jenda"],
    sreality: [2684, 3320, 2805],
    bazos: [947, 1086, 1189],
    geoguessr: [21898, 20385, 16868],
  },
  {
    date: "2026-09-21",
    players: ["Laďa", "Honza", "Jenda"],
    sreality: [1755, 3010, 1825],
    bazos: [1746, 2595, 2071],
    geoguessr: [13250, 15311, 15153],
  },
];
