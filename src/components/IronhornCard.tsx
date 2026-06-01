import type { CSSProperties } from "react";
import type { IronhornLevel } from "@/lib/progression";

type IronhornCardProps = {
  level: IronhornLevel;
  currentStreak: number;
  lifetimeXp: number;
};

export function IronhornCard({
  level,
  currentStreak,
  lifetimeXp,
}: IronhornCardProps) {
  const armorCharge = Math.min(100, Math.round((currentStreak / 365) * 100));

  return (
    <section
      className="ironhorn-card"
      style={{ "--level-accent": level.accent } as CSSProperties}
      aria-labelledby="ironhorn-title"
    >
      <div className="ironhorn-art" aria-hidden="true">
        <div className="horn horn-left" />
        <div className="horn horn-right" />
        <div className="bison-head">
          <div className="brow" />
          <div className="muzzle" />
        </div>
        <div className="armor-plate" />
      </div>

      <div className="ironhorn-copy">
        <p className="eyebrow">Bison Guardian</p>
        <h2 id="ironhorn-title">Ironhorn</h2>
        <p className="rank">{level.title}</p>
        <p className="description">{level.description}</p>

        <div className="armor-meter" aria-label={`Armor charge ${armorCharge}%`}>
          <span>Armor: {level.armor}</span>
          <div className="meter-track">
            <div
              className="meter-fill"
              style={{ width: `${Math.max(8, armorCharge)}%` }}
            />
          </div>
        </div>

        <div className="guardian-meta">
          <span>{currentStreak} day streak</span>
          <span>{lifetimeXp} lifetime XP</span>
        </div>
      </div>
    </section>
  );
}
