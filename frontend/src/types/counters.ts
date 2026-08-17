/** raw star counts from the backend: issued, saved, destroyed. */
interface Counters {
  readonly issued: number;
  readonly saved: number;
  readonly destroyed: number;
}

export type { Counters };
