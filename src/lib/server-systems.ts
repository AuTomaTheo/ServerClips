import { SERVER_SYSTEMS, type ServerSystemKey } from "@/lib/constants";

export type ServerSystemsInput = Partial<Record<ServerSystemKey, boolean>>;

export type ServerWithSystems = ServerSystemsInput;

export function systemsFromServer(server: ServerWithSystems): { key: ServerSystemKey; label: string }[] {
  return SERVER_SYSTEMS.filter((s) => server[s.key] === true);
}

export function parseSystemsPayload(
  systems: ServerSystemsInput | undefined
): Record<ServerSystemKey, boolean> {
  const out = {} as Record<ServerSystemKey, boolean>;
  for (const s of SERVER_SYSTEMS) {
    out[s.key] = systems?.[s.key] === true;
  }
  return out;
}

export function buildServerSystemsWhere(
  activeSystems: ServerSystemKey[]
): Record<string, boolean>[] {
  return activeSystems.map((key) => ({ [key]: true }));
}

export function otherSystemsLabels(otherSystems?: string | null): string[] {
  if (!otherSystems?.trim()) return [];
  return otherSystems
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
