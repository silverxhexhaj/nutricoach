"use client";

import { useMemo, useState } from "react";

export type TabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type TabsProps = {
  tabs: TabItem[];
  defaultTabId?: string;
  className?: string;
};

export function Tabs({ tabs, defaultTabId, className = "" }: TabsProps) {
  const firstId = tabs[0]?.id;
  const initial = defaultTabId && tabs.some((tab) => tab.id === defaultTabId) ? defaultTabId : firstId;
  const [activeId, setActiveId] = useState<string | undefined>(initial);

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeId) ?? tabs[0],
    [tabs, activeId]
  );

  if (!activeTab) return null;

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveId(tab.id)}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "border-green bg-[var(--green-10)] text-green"
                  : "border-[var(--green-08)] text-text-dim hover:text-green"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div>{activeTab.content}</div>
    </div>
  );
}
