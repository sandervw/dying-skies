import { createSeededRandom } from "./randomService";
import type { RandomNumberGenerator } from "./randomService";
import type { Dot, Edge, Sky, NearnessEntry, CandidateEdge } from "../types/sky";

////////////////////////////////////////////////////////////
// DOTS
////////////////////////////////////////////////////////////

// tunable range for dot count.
const DOT_COUNT_MINIMUM = 4;
const DOT_COUNT_MAXIMUM = 200;

// map a 0..1 draw into the [minimum, maximum) range.
const randomInRange = (
  random: RandomNumberGenerator,
  minimum: number,
  maximum: number,
): number => minimum + random() * (maximum - minimum);

// build the static dot field; x/y are 0..1 fractions.
const generateDots = (random: RandomNumberGenerator): readonly Dot[] => {
  const count = Math.floor(
    randomInRange(random, DOT_COUNT_MINIMUM, DOT_COUNT_MAXIMUM + 1),
  );
  const dots: Dot[] = [];
  for (let index = 0; index < count; index += 1) {
    dots.push({
      x: random(),
      y: random(),
    });
  }
  return dots;
};

////////////////////////////////////////////////////////////
// CONSTELLATION
////////////////////////////////////////////////////////////

// tunable ranges for star count and loop density.
const CONSTELLATION_STAR_MINIMUM = 2;
const CONSTELLATION_STAR_MAXIMUM = 12;
const LOOP_EDGE_RATIO = 0.3; // 0 = always trees; higher = more loops

// squared distance in 0..1 space; ordering is all we need.
const squaredDistanceBetween = (first: Dot, second: Dot): number => {
  const deltaX = first.x - second.x;
  const deltaY = first.y - second.y;
  return deltaX * deltaX + deltaY * deltaY;
};

// key an undirected edge independent of endpoint order.
const edgeKey = (from: number, to: number): string =>
  from < to ? `${from}-${to}` : `${to}-${from}`;

// pick a seed-chosen anchor, then gather its nearest neighbours as members.
const selectMemberIndices = (
  dots: readonly Dot[],
  random: RandomNumberGenerator,
  starCount: number,
): readonly number[] => {
  const anchorIndex = Math.floor(random() * dots.length);
  const anchor = dots[anchorIndex];
  const byNearness = dots.map(
    (dot: Dot, index: number): NearnessEntry => ({
      index,
      squaredDistance: squaredDistanceBetween(dot, anchor),
    }),
  );
  byNearness.sort(
    (left: NearnessEntry, right: NearnessEntry): number =>
      left.squaredDistance - right.squaredDistance,
  );
  return byNearness
    .slice(0, starCount)
    .map((entry: NearnessEntry): number => entry.index);
};

// link members with a minimum spanning tree (Prim's).
const buildMinimumSpanningTree = (
  dots: readonly Dot[],
  memberIndices: readonly number[],
): readonly Edge[] => {
  const edges: Edge[] = [];
  const connected = new Set<number>([memberIndices[0]]);
  const remaining = new Set<number>(memberIndices.slice(1));
  while (remaining.size > 0) {
    let nearestFrom = -1;
    let nearestTo = -1;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const from of connected) {
      for (const to of remaining) {
        const distance = squaredDistanceBetween(dots[from], dots[to]);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestFrom = from;
          nearestTo = to;
        }
      }
    }
    edges.push({ from: nearestFrom, to: nearestTo });
    connected.add(nearestTo);
    remaining.delete(nearestTo);
  }
  return edges;
};

// add the shortest non-tree edges to close a few loops.
const collectLoopEdges = (
  dots: readonly Dot[],
  memberIndices: readonly number[],
  treeEdges: readonly Edge[],
  extraCount: number,
): readonly Edge[] => {
  if (extraCount <= 0) {
    return [];
  }
  const treeKeys = new Set<string>(
    treeEdges.map((edge: Edge): string => edgeKey(edge.from, edge.to)),
  );
  const candidates: CandidateEdge[] = [];
  for (let outer = 0; outer < memberIndices.length; outer += 1) {
    for (let inner = outer + 1; inner < memberIndices.length; inner += 1) {
      const from = memberIndices[outer];
      const to = memberIndices[inner];
      if (treeKeys.has(edgeKey(from, to))) {
        continue;
      }
      candidates.push({
        from,
        to,
        squaredDistance: squaredDistanceBetween(dots[from], dots[to]),
      });
    }
  }
  candidates.sort(
    (left: CandidateEdge, right: CandidateEdge): number =>
      left.squaredDistance - right.squaredDistance,
  );
  return candidates
    .slice(0, extraCount)
    .map((candidate: CandidateEdge): Edge => ({
      from: candidate.from,
      to: candidate.to,
    }));
};

// build one constellation: a tree backbone plus optional loop edges.
const generateConstellation = (
  dots: readonly Dot[],
  random: RandomNumberGenerator,
): readonly Edge[] => {
  if (dots.length < CONSTELLATION_STAR_MINIMUM) {
    return [];
  }
  const desiredStarCount = Math.floor(
    CONSTELLATION_STAR_MINIMUM +
    random() * (CONSTELLATION_STAR_MAXIMUM + 1 - CONSTELLATION_STAR_MINIMUM),
  );
  const starCount = Math.min(desiredStarCount, dots.length);
  const memberIndices = selectMemberIndices(dots, random, starCount);
  const treeEdges = buildMinimumSpanningTree(dots, memberIndices);
  const maximumLoopEdges = Math.floor(starCount * LOOP_EDGE_RATIO);
  const loopEdgeCount = Math.floor(random() * (maximumLoopEdges + 1));
  const loopEdges = collectLoopEdges(dots, memberIndices, treeEdges, loopEdgeCount);
  return [...treeEdges, ...loopEdges];
};

////////////////////////////////////////////////////////////
// SKY
////////////////////////////////////////////////////////////

// generate a full sky (dots + constellation) from one seed.
const generateSky = (seed: number): Sky => {
  const random = createSeededRandom(seed);
  const dots = generateDots(random);
  const edges = generateConstellation(dots, random);
  return { dots, edges };
};

////////////////////////////////////////////////////////////
// RENDERING
////////////////////////////////////////////////////////////

const FULL_CIRCLE_RADIANS = Math.PI * 2;
const DOT_RADIUS = 1;
const LINE_WIDTH = 1;
const LINE_OPACITY = 0.5;
const LINE_END_GAP_PIXELS = 5;

// paint each dot as a solid white point.
const drawDots = (
  context: CanvasRenderingContext2D,
  dots: readonly Dot[],
  width: number,
  height: number,
): void => {
  context.fillStyle = "#ffffff";
  for (const dot of dots) {
    context.beginPath();
    context.arc(dot.x * width, dot.y * height, DOT_RADIUS, 0, FULL_CIRCLE_RADIANS);
    context.fill();
  }
};

// stroke each edge, trimmed at both ends for breathing room.
const drawConstellation = (
  context: CanvasRenderingContext2D,
  dots: readonly Dot[],
  edges: readonly Edge[],
  width: number,
  height: number,
): void => {
  context.strokeStyle = `rgba(255, 255, 255, ${LINE_OPACITY})`;
  context.lineWidth = LINE_WIDTH;
  for (const edge of edges) {
    const start = dots[edge.from];
    const end = dots[edge.to];
    const startX = start.x * width;
    const startY = start.y * height;
    const endX = end.x * width;
    const endY = end.y * height;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const length = Math.hypot(deltaX, deltaY);
    if (length <= LINE_END_GAP_PIXELS * 2) {
      continue; // nothing left once both gaps are removed.
    }
    const unitX = deltaX / length;
    const unitY = deltaY / length;
    context.beginPath();
    context.moveTo(
      startX + unitX * LINE_END_GAP_PIXELS,
      startY + unitY * LINE_END_GAP_PIXELS,
    );
    context.lineTo(
      endX - unitX * LINE_END_GAP_PIXELS,
      endY - unitY * LINE_END_GAP_PIXELS,
    );
    context.stroke();
  }
};

// clear the field, then layer constellation lines beneath the dots.
const renderSky = (
  context: CanvasRenderingContext2D,
  sky: Sky,
  width: number,
  height: number,
): void => {
  context.clearRect(0, 0, width, height);
  drawConstellation(context, sky.dots, sky.edges, width, height);
  drawDots(context, sky.dots, width, height);
};

export { generateSky, renderSky };
