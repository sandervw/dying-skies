# React Patterns & Principles Reference

A concise reference of modern React architecture patterns and best practices, specifically tailored to clean component composition, hooks architecture, and high-performance canvas/DOM integration.

---

## 1. Component Design & Responsibility
- **Pure Presentation (Views):** Components receive props, render JSX, and pass UI events to handlers. Zero data-fetching or async orchestrations inside JSX components.
- **Props Contracts:** Props interfaces defined at top of file, fully typed, inputs treated as immutable (`readonly`).
- **Composition over Inheritance:** Compose visual layers (e.g. background canvas, interaction overlays, HUD) using distinct sibling components controlled by state.

---

## 2. Custom Hooks & State Boundaries
- **Encapsulated Subsystems:** Complex stateful domains (e.g. canvas animation loops, input controllers, device listeners) belong in dedicated custom hooks (`use*`).
- **Expose Intent, Not Internals:** Hooks should return clear handlers, callbacks, and refs needed by views rather than internal mutable states.
- **Stable References:** Handlers and callback props passed across effect boundaries should use `useCallback` or `useRef` bridges when needed to prevent effect churn.

---

## 3. Effects & External Systems (`useEffect`)
- **Strict Boundary for External Systems:** `useEffect` is only for synchronizing with non-React systems (DOM event listeners, requestAnimationFrame loops, Web APIs, timers).
- **Cleanup Invariance:** Every subscription or timer inside an effect must return a comprehensive teardown function to prevent memory leaks and duplicate loops.
- **No Internal Cascade Effects:** Never use `useEffect` to copy props into state or compute values that can be derived during render or calculated synchronously in event handlers.

---

## 4. Canvas & Imperative Lifecycle Integration
- **Ref-driven State:** Fast tick rates (60/120fps rAF) must update mutable animation state in `useRef` or local closure variables inside the loop rather than triggering React re-renders every frame.
- **Pointer/Event Bridging:** Pointer interactions on `<canvas>` should translate `clientX`/`clientY` through bounding rect offsets into coordinate systems matching the canvas backing store.
- **Decoupled Hit-Testing:** Hit-testing algorithms and spatial calculations should live in pure service modules, keeping hooks focused on event binding and callback orchestration.

---

## 5. Event Handling & Cursor Interactivity
- **Single Function Handlers:** If an event handler does more than invoke a single function, extract it into a named function.
- **Dynamic Cursors:** For canvas elements where cursor changes based on hover over sub-elements, update the canvas element's `style.cursor` directly or via a minimal hook state/class.
- **Non-blocking Operations:** Star selection / sky traversal callbacks should execute immediately upon hit confirmation without blocking frame rendering.
