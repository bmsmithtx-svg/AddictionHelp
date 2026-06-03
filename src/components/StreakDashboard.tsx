"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { IronhornCard } from "@/components/IronhornCard";
import {
  IRONHORN_LEVELS,
  getIronhornLevel,
  getLevelProgress,
  getXpForCompletion,
} from "@/lib/progression";

type TrackerState = {
  currentStreak: number;
  lifetimeXp: number;
  totalCompletedDays: number;
  lastCompletedDate: string | null;
  rebuilds: number;
};

const STORAGE_KEY = "levelupbison-tracker-v1";
const TRACKER_CHANGE_EVENT = "levelupbison-tracker-change";

const DEFAULT_TRACKER: TrackerState = {
  currentStreak: 0,
  lifetimeXp: 0,
  totalCompletedDays: 0,
  lastCompletedDate: null,
  rebuilds: 0,
};

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateKeyToUtcTime(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function daysBetweenDateKeys(fromDateKey: string, toDateKey: string) {
  const dayLength = 24 * 60 * 60 * 1000;
  return Math.round(
    (dateKeyToUtcTime(toDateKey) - dateKeyToUtcTime(fromDateKey)) / dayLength,
  );
}

function readStoredTracker(): TrackerState {
  if (typeof window === "undefined") {
    return DEFAULT_TRACKER;
  }

  try {
    const savedTracker = window.localStorage.getItem(STORAGE_KEY);

    if (!savedTracker) {
      return DEFAULT_TRACKER;
    }

    const parsedTracker = JSON.parse(savedTracker) as Partial<TrackerState>;

    return {
      ...DEFAULT_TRACKER,
      ...parsedTracker,
      currentStreak: Math.max(0, Number(parsedTracker.currentStreak ?? 0)),
      lifetimeXp: Math.max(0, Number(parsedTracker.lifetimeXp ?? 0)),
      totalCompletedDays: Math.max(
        0,
        Number(parsedTracker.totalCompletedDays ?? 0),
      ),
      rebuilds: Math.max(0, Number(parsedTracker.rebuilds ?? 0)),
      lastCompletedDate: parsedTracker.lastCompletedDate ?? null,
    };
  } catch {
    return DEFAULT_TRACKER;
  }
}

function subscribeToTracker(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(TRACKER_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(TRACKER_CHANGE_EVENT, onStoreChange);
  };
}

function saveTracker(tracker: TrackerState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tracker));
  window.dispatchEvent(new Event(TRACKER_CHANGE_EVENT));
}

function completeToday(tracker: TrackerState) {
  const todayKey = getTodayKey();

  if (tracker.lastCompletedDate === todayKey) {
    return {
      tracker,
      message: "Today is already completed. Keep that ground.",
    };
  }

  const gapDays = tracker.lastCompletedDate
    ? daysBetweenDateKeys(tracker.lastCompletedDate, todayKey)
    : null;
  const continuesStreak = gapDays === 1;
  const nextStreak =
    tracker.currentStreak > 0 && continuesStreak
      ? tracker.currentStreak + 1
      : 1;
  const earnedXp = getXpForCompletion(nextStreak);

  return {
    tracker: {
      ...tracker,
      currentStreak: nextStreak,
      lifetimeXp: tracker.lifetimeXp + earnedXp,
      totalCompletedDays: tracker.totalCompletedDays + 1,
      lastCompletedDate: todayKey,
    },
    message:
      continuesStreak || tracker.currentStreak === 0
        ? `Today is complete. Ironhorn gained ${earnedXp} XP.`
        : `New rebuild started. Ironhorn gained ${earnedXp} XP and lifetime progress stayed saved.`,
  };
}

export function StreakDashboard() {
  const tracker = useSyncExternalStore(
    subscribeToTracker,
    readStoredTracker,
    () => DEFAULT_TRACKER,
  );
  const [message, setMessage] = useState("Progress saved. Keep going.");

  const todayKey = getTodayKey();
  const todayCompleted = tracker.lastCompletedDate === todayKey;
  const level = getIronhornLevel(tracker.currentStreak);
  const levelProgress = useMemo(
    () => getLevelProgress(tracker.currentStreak),
    [tracker.currentStreak],
  );

  function handleCompleteToday() {
    const result = completeToday(tracker);
    saveTracker(result.tracker);
    setMessage(result.message);
  }

  function handleRestart() {
    saveTracker({
      ...tracker,
      currentStreak: 0,
      lastCompletedDate: null,
      rebuilds: tracker.rebuilds + 1,
    });
    setMessage(
      "Current streak restarted. Lifetime XP and total progress stayed saved.",
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">LevelUpBison</p>
          <h1>Build the streak. Strengthen Ironhorn.</h1>
        </div>
        <span className="save-status">{message}</span>
      </header>

      <div className="dashboard-grid">
        <section className="tracker-panel" aria-labelledby="streak-title">
          <div className="streak-header">
            <div>
              <p className="eyebrow">Current Streak</p>
              <h2 id="streak-title">
                {tracker.currentStreak}
                <span>{tracker.currentStreak === 1 ? " day" : " days"}</span>
              </h2>
            </div>
            <div className="level-badge">{level.title}</div>
          </div>

          <div className="progress-block">
            <div className="progress-copy">
              <span>Level progress</span>
              {levelProgress.nextLevel ? (
                <strong>
                  {levelProgress.daysToNext} days to{" "}
                  {levelProgress.nextLevel.title}
                </strong>
              ) : (
                <strong>Highest level reached</strong>
              )}
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${levelProgress.percent}%` }}
              />
            </div>
          </div>

          <div className="action-row">
            <button
              className="primary-button"
              type="button"
              onClick={handleCompleteToday}
              disabled={todayCompleted}
            >
              {todayCompleted ? "Today completed" : "Mark today complete"}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={handleRestart}
            >
              Restart current streak
            </button>
          </div>

          <dl className="stats-list">
            <div>
              <dt>Lifetime XP</dt>
              <dd>{tracker.lifetimeXp}</dd>
            </div>
            <div>
              <dt>Total completed days</dt>
              <dd>{tracker.totalCompletedDays}</dd>
            </div>
            <div>
              <dt>Rebuilds</dt>
              <dd>{tracker.rebuilds}</dd>
            </div>
          </dl>
        </section>

        <IronhornCard
          level={level}
          currentStreak={tracker.currentStreak}
          lifetimeXp={tracker.lifetimeXp}
        />
      </div>

      <section className="level-path" aria-labelledby="level-path-title">
        <div className="section-heading">
          <p className="eyebrow">Ironhorn Path</p>
          <h2 id="level-path-title">Levels earned by streak days</h2>
        </div>
        <ol>
          {IRONHORN_LEVELS.map((ironhornLevel) => {
            const isReached = tracker.currentStreak >= ironhornLevel.days;

            return (
              <li
                key={ironhornLevel.title}
                className={isReached ? "reached" : undefined}
              >
                <span>Day {ironhornLevel.days}</span>
                <strong>{ironhornLevel.title}</strong>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
