interface Preventable {
  preventDefault: () => void;
}

const block = (event: Preventable): void => event.preventDefault();

/** Input props forcing manual entry; blocks paste, drop, and autofill. */
const manualEntryGuards = {
  autoComplete: "off",
  spellCheck: false,
  "data-1p-ignore": "true",
  "data-lpignore": "true",
  "data-bwignore": "true",
  "data-form-type": "other",
  onPaste: block,
  onDrop: block,
} as const;

export { manualEntryGuards };
