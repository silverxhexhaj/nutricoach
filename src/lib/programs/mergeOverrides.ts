import type {
  ProgramItem,
  ProgramDay,
  ClientProgramItemOverride,
  MergedProgramItem,
} from "@/types/program";

/**
 * Merges template program items with per-client overrides for a single day.
 *
 * - `hide`    overrides remove the template item
 * - `replace` overrides swap title / content / type on the template item
 * - `add`     overrides append new client-only items
 */
export function mergeDayItems(
  templateItems: ProgramItem[],
  overrides: ClientProgramItemOverride[]
): MergedProgramItem[] {
  const hideSet = new Set<string>();
  const replaceMap = new Map<string, ClientProgramItemOverride>();
  const additions: ClientProgramItemOverride[] = [];

  for (const o of overrides) {
    switch (o.action) {
      case "hide":
        if (o.source_item_id) hideSet.add(o.source_item_id);
        break;
      case "replace":
        if (o.source_item_id) replaceMap.set(o.source_item_id, o);
        break;
      case "add":
        additions.push(o);
        break;
    }
  }

  const merged: MergedProgramItem[] = [];

  for (const item of templateItems) {
    if (hideSet.has(item.id)) {
      merged.push({
        ...item,
        isHidden: true,
        overrideId: overrides.find(
          (o) => o.action === "hide" && o.source_item_id === item.id
        )?.id,
        overrideAction: "hide",
      });
      continue;
    }

    const replacement = replaceMap.get(item.id);
    if (replacement) {
      merged.push({
        ...item,
        title: replacement.title ?? item.title,
        type: replacement.type ?? item.type,
        content: replacement.content ?? item.content,
        sort_order:
          replacement.sort_order !== 0 ? replacement.sort_order : item.sort_order,
        overrideId: replacement.id,
        overrideAction: "replace",
        isCustomized: true,
      });
    } else {
      merged.push({ ...item });
    }
  }

  for (const add of additions) {
    if (!add.type || !add.title) continue;
    merged.push({
      id: add.id,
      program_day_id: add.program_day_id,
      type: add.type,
      title: add.title,
      content: add.content,
      sort_order: add.sort_order,
      overrideId: add.id,
      overrideAction: "add",
      isClientOnly: true,
    });
  }

  return merged.sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Applies overrides to every day of a program, returning ProgramDay[] with
 * merged items. Hidden items are excluded from the result (they are only
 * visible in the coach-client editing view).
 */
export function mergeOverridesIntoDays(
  days: ProgramDay[],
  overrides: ClientProgramItemOverride[],
  opts?: { includeHidden?: boolean }
): (ProgramDay & { items: MergedProgramItem[] })[] {
  const overridesByDay = new Map<string, ClientProgramItemOverride[]>();
  for (const o of overrides) {
    const list = overridesByDay.get(o.program_day_id) ?? [];
    list.push(o);
    overridesByDay.set(o.program_day_id, list);
  }

  return days.map((day) => {
    const dayOverrides = overridesByDay.get(day.id) ?? [];
    let merged = mergeDayItems(day.items, dayOverrides);

    if (!opts?.includeHidden) {
      merged = merged.filter((m) => !m.isHidden);
    }

    return { ...day, items: merged };
  });
}
