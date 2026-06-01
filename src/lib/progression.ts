export type IronhornLevel = {
  days: number;
  title: string;
  description: string;
  armor: string;
  accent: string;
};

export const IRONHORN_LEVELS: IronhornLevel[] = [
  {
    days: 0,
    title: "Lost Calf",
    description: "A new start is still a start.",
    armor: "Bare hide",
    accent: "#8a6b42",
  },
  {
    days: 1,
    title: "Young Bison",
    description: "The first day is claimed.",
    armor: "Trail wrap",
    accent: "#3f7a57",
  },
  {
    days: 3,
    title: "Trail Walker",
    description: "Momentum is beginning to show.",
    armor: "Worn leather",
    accent: "#2f6f73",
  },
  {
    days: 7,
    title: "Ironhorn",
    description: "One full week on the trail.",
    armor: "Iron brow guard",
    accent: "#7a6f5f",
  },
  {
    days: 14,
    title: "Shield Bearer",
    description: "Strength is becoming structure.",
    armor: "Bronze shoulder plates",
    accent: "#a96538",
  },
  {
    days: 30,
    title: "Guardian Bison",
    description: "A month of rebuilding is real power.",
    armor: "Guardian cuirass",
    accent: "#315f48",
  },
  {
    days: 60,
    title: "Mountain Guardian",
    description: "Steady enough to climb higher.",
    armor: "Stonebound armor",
    accent: "#5d7180",
  },
  {
    days: 90,
    title: "Titan Bison",
    description: "The trail has become a fortress.",
    armor: "Titan plate",
    accent: "#9b7b2f",
  },
  {
    days: 180,
    title: "Legendary Guardian",
    description: "A long watch, earned one day at a time.",
    armor: "Legend guard",
    accent: "#7f4e6f",
  },
  {
    days: 365,
    title: "Immortal Bison",
    description: "A year of courage made visible.",
    armor: "Immortal mantle",
    accent: "#214f61",
  },
];

export function getIronhornLevel(streakDays: number): IronhornLevel {
  return IRONHORN_LEVELS.reduce((currentLevel, level) => {
    return streakDays >= level.days ? level : currentLevel;
  }, IRONHORN_LEVELS[0]);
}

export function getNextIronhornLevel(streakDays: number): IronhornLevel | null {
  return IRONHORN_LEVELS.find((level) => level.days > streakDays) ?? null;
}

export function getLevelProgress(streakDays: number) {
  const currentLevel = getIronhornLevel(streakDays);
  const nextLevel = getNextIronhornLevel(streakDays);

  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel,
      daysIntoLevel: streakDays - currentLevel.days,
      daysToNext: 0,
      percent: 100,
    };
  }

  const levelSpan = nextLevel.days - currentLevel.days;
  const daysIntoLevel = streakDays - currentLevel.days;
  const percent = Math.min(100, Math.round((daysIntoLevel / levelSpan) * 100));

  return {
    currentLevel,
    nextLevel,
    daysIntoLevel,
    daysToNext: nextLevel.days - streakDays,
    percent,
  };
}

export function getXpForCompletion(streakAfterCompletion: number): number {
  const weeklyBonus = Math.min(40, Math.floor(streakAfterCompletion / 7) * 2);
  return 10 + weeklyBonus;
}
