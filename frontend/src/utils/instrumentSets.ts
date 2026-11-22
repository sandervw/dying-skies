/** Sets load from assets/instrumentSets; NEVER ADJUST INSTRUMENTS, fix sound in musicService. */

import type { InstrumentSpec, Role } from "../types/music";

// one set as stored in JSON: display name plus every role.
type RawSet = Record<Role, InstrumentSpec> & { displayName: string };

// every set JSON, bundled at build time.
const modules = import.meta.glob<{ default: RawSet }>(
  "../assets/instrumentSets/*.json",
  { eager: true },
);

// set name is the JSON filename without extension.
const nameOf = (path: string): string =>
  path.split("/").pop()!.replace(".json", "");

/** the instrument sets as stored in JSON, keyed by name. */
const INSTRUMENT_SETS = Object.fromEntries(
  Object.keys(modules).sort().map((path) => [nameOf(path), modules[path].default]),
) as Record<string, RawSet>;

/** human-readable name for each instrument set, read from its JSON. */
const INSTRUMENT_SET_DISPLAY_NAMES = Object.fromEntries(
  Object.keys(modules).map((path) => [nameOf(path), modules[path].default.displayName]),
) as Record<string, string>;

export { INSTRUMENT_SETS, INSTRUMENT_SET_DISPLAY_NAMES };
