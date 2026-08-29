import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, ReactElement } from "react";
import { createSeededRandom, generateSeed } from "../services/randomService";
import type { RandomNumberGenerator } from "../services/randomService";
import { toCssColor } from "../services/paletteService";
import { buildStar, drawStar } from "../services/starService";
import type { Palette, PaletteColor } from "../types/palette";
import type { SkyProfile } from "../types/sky";

const CANVAS_WIDTH = 960;
const GRID_COLUMNS = 4;
const GRID_ROWS = 4;
const PALETTE_COUNT = GRID_COLUMNS * GRID_ROWS;
const CARD_HEIGHT = 150;
const SWATCH_HEIGHT = 22;
const COMET_SCALE = 1.7;
const DEGREES_IN_CIRCLE = 360;

// knobs: per-palette "mood" ranges plus within-comet spreads.
interface LabKnobs {
  readonly colorCountMinimum: number;
  readonly colorCountMaximum: number;
  readonly hueStopCount: number;
  readonly saturationCenterMinimum: number;
  readonly saturationCenterMaximum: number;
  readonly lightnessCenterMinimum: number;
  readonly lightnessCenterMaximum: number;
  readonly hueSpanMinimum: number;
  readonly hueSpanMaximum: number;
  readonly saturationSpread: number;
  readonly lightnessSpread: number;
  readonly hueJitterDegrees: number;
}

const DEFAULT_KNOBS: LabKnobs = {
  colorCountMinimum: 6,
  colorCountMaximum: 12,
  hueStopCount: 5,
  saturationCenterMinimum: 25,
  saturationCenterMaximum: 85,
  lightnessCenterMinimum: 32,
  lightnessCenterMaximum: 78,
  hueSpanMinimum: 10,
  hueSpanMaximum: 80,
  saturationSpread: 12,
  lightnessSpread: 12,
  hueJitterDegrees: 8,
};

interface KnobDescriptor {
  readonly key: keyof LabKnobs;
  readonly label: string;
  readonly section: string;
  readonly minimum: number;
  readonly maximum: number;
  readonly step: number;
}

const KNOBS: readonly KnobDescriptor[] = [
  { key: "colorCountMinimum", label: "Colour count min", section: "Shape", minimum: 1, maximum: 16, step: 1 },
  { key: "colorCountMaximum", label: "Colour count max", section: "Shape", minimum: 1, maximum: 16, step: 1 },
  { key: "hueStopCount", label: "Hue stops", section: "Shape", minimum: 2, maximum: 12, step: 1 },
  { key: "saturationCenterMinimum", label: "Saturation centre min", section: "Between-sky mood", minimum: 0, maximum: 100, step: 1 },
  { key: "saturationCenterMaximum", label: "Saturation centre max", section: "Between-sky mood", minimum: 0, maximum: 100, step: 1 },
  { key: "lightnessCenterMinimum", label: "Lightness centre min", section: "Between-sky mood", minimum: 0, maximum: 100, step: 1 },
  { key: "lightnessCenterMaximum", label: "Lightness centre max", section: "Between-sky mood", minimum: 0, maximum: 100, step: 1 },
  { key: "hueSpanMinimum", label: "Hue span min", section: "Between-sky mood", minimum: 0, maximum: 180, step: 1 },
  { key: "hueSpanMaximum", label: "Hue span max", section: "Between-sky mood", minimum: 0, maximum: 180, step: 1 },
  { key: "saturationSpread", label: "Saturation spread", section: "Within-comet cohesion", minimum: 0, maximum: 40, step: 1 },
  { key: "lightnessSpread", label: "Lightness spread", section: "Within-comet cohesion", minimum: 0, maximum: 40, step: 1 },
  { key: "hueJitterDegrees", label: "Hue jitter", section: "Within-comet cohesion", minimum: 0, maximum: 30, step: 1 },
];

const randomInRange = (
  random: RandomNumberGenerator,
  minimum: number,
  maximum: number,
): number => minimum + random() * (maximum - minimum);

const clampPercent = (value: number): number => Math.min(100, Math.max(0, value));

const normalizeHue = (hue: number): number =>
  ((hue % DEGREES_IN_CIRCLE) + DEGREES_IN_CIRCLE) % DEGREES_IN_CIRCLE;

// evenly spaced hue anchors across the span, centred on the base hue.
const buildHueOffsets = (spanDegrees: number, stopCount: number): number[] => {
  if (stopCount <= 1) {
    return [0];
  }
  const step = spanDegrees / (stopCount - 1);
  return Array.from({ length: stopCount }, (_unused, index) => -spanDegrees / 2 + index * step);
};

// draw one palette's mood once, then vary colours narrowly around it.
const generateLabPalette = (seed: number, knobs: LabKnobs): Palette => {
  const random = createSeededRandom(seed);
  const baseHue = random() * DEGREES_IN_CIRCLE;
  const saturationCenter = randomInRange(random, knobs.saturationCenterMinimum, knobs.saturationCenterMaximum);
  const lightnessCenter = randomInRange(random, knobs.lightnessCenterMinimum, knobs.lightnessCenterMaximum);
  const hueSpan = randomInRange(random, knobs.hueSpanMinimum, knobs.hueSpanMaximum);
  const colorCount = Math.max(
    1,
    Math.floor(randomInRange(random, knobs.colorCountMinimum, knobs.colorCountMaximum + 1)),
  );
  const offsets = buildHueOffsets(hueSpan, knobs.hueStopCount);
  const colors: PaletteColor[] = [];
  for (let index = 0; index < colorCount; index += 1) {
    const anchorOffset = offsets[index % offsets.length];
    colors.push({
      hue: normalizeHue(
        baseHue + anchorOffset + randomInRange(random, -knobs.hueJitterDegrees, knobs.hueJitterDegrees),
      ),
      saturation: clampPercent(saturationCenter + randomInRange(random, -knobs.saturationSpread, knobs.saturationSpread)),
      lightness: clampPercent(lightnessCenter + randomInRange(random, -knobs.lightnessSpread, knobs.lightnessSpread)),
    });
  }
  return { colors };
};

// paint one comet plus its palette swatches inside a grid cell.
const drawCard = (
  context: CanvasRenderingContext2D,
  width: number,
  palette: Palette,
  cometSeedSource: number,
): void => {
  const profile: SkyProfile = { palette, fallAngle: 0 };
  const star = buildStar(generateSeed(createSeededRandom(cometSeedSource)), null, 0, profile, 0, 0);
  context.save();
  context.translate(width / 2, (CARD_HEIGHT - SWATCH_HEIGHT) / 2);
  context.scale(COMET_SCALE, COMET_SCALE);
  drawStar(context, star, profile, 0);
  context.restore();
  const swatchWidth = width / palette.colors.length;
  palette.colors.forEach((color, index): void => {
    context.fillStyle = toCssColor(color);
    context.fillRect(index * swatchWidth, CARD_HEIGHT - SWATCH_HEIGHT, swatchWidth + 1, SWATCH_HEIGHT);
  });
};

// redraw the whole grid for the current knobs and shuffle seed.
const drawGrid = (
  canvas: HTMLCanvasElement,
  knobs: LabKnobs,
  shuffleSeed: number,
): void => {
  const context = canvas.getContext("2d");
  if (context === null) {
    return;
  }
  const height = GRID_ROWS * CARD_HEIGHT;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(CANVAS_WIDTH * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${CANVAS_WIDTH}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, CANVAS_WIDTH, height);
  const cardWidth = CANVAS_WIDTH / GRID_COLUMNS;
  for (let index = 0; index < PALETTE_COUNT; index += 1) {
    const column = index % GRID_COLUMNS;
    const row = Math.floor(index / GRID_COLUMNS);
    const palette = generateLabPalette(shuffleSeed * 1000 + index, knobs);
    context.save();
    context.translate(column * cardWidth, row * CARD_HEIGHT);
    drawCard(context, cardWidth, palette, shuffleSeed * 7919 + index);
    context.restore();
  }
};

// throwaway inline styling; deliberately kept out of the shared stylesheet.
const styles: Record<string, CSSProperties> = {
  page: { display: "flex", minHeight: "100vh", background: "#0a0a0a", color: "#e6e6e6" },
  panel: { width: 280, padding: 16, boxSizing: "border-box", overflowY: "auto", height: "100vh" },
  title: { fontSize: 18, margin: "0 0 12px" },
  section: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#888", margin: "14px 0 6px" },
  label: { display: "flex", flexDirection: "column", fontSize: 12, marginBottom: 8, gap: 4 },
  buttonRow: { display: "flex", gap: 8, margin: "12px 0" },
  button: { flex: 1, padding: "6px 8px", cursor: "pointer", background: "#1c1c1c", color: "#e6e6e6", border: "1px solid #333" },
  code: { fontSize: 11, background: "#141414", padding: 8, whiteSpace: "pre-wrap", overflowX: "auto" },
  main: { flex: 1, padding: 16, overflow: "auto" },
};

/** throwaway lab: preview comet palettes while tuning generation knobs. */
const PaletteLab = (): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [knobs, setKnobs] = useState<LabKnobs>(DEFAULT_KNOBS);
  const [shuffleSeed, setShuffleSeed] = useState<number>(1);

  useEffect((): void => {
    if (canvasRef.current !== null) {
      drawGrid(canvasRef.current, knobs, shuffleSeed);
    }
  }, [knobs, shuffleSeed]);

  const updateKnob =
    (key: keyof LabKnobs) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      const value = Number(event.target.value);
      setKnobs((previous): LabKnobs => ({ ...previous, [key]: value }));
    };

  return (
    <div style={styles.page}>
      <aside style={styles.panel}>
        <h1 style={styles.title}>Palette Lab</h1>
        {KNOBS.map((knob, index): ReactElement => (
          <div key={knob.key}>
            {index === 0 || KNOBS[index - 1].section !== knob.section ? (
              <h2 style={styles.section}>{knob.section}</h2>
            ) : null}
            <label style={styles.label}>
              <span>{knob.label}: {knobs[knob.key]}</span>
              <input
                type="range"
                min={knob.minimum}
                max={knob.maximum}
                step={knob.step}
                value={knobs[knob.key]}
                onChange={updateKnob(knob.key)}
              />
            </label>
          </div>
        ))}
        <div style={styles.buttonRow}>
          <button type="button" style={styles.button} onClick={(): void => setShuffleSeed((previous) => previous + 1)}>
            Reshuffle
          </button>
          <button type="button" style={styles.button} onClick={(): void => setKnobs(DEFAULT_KNOBS)}>
            Reset
          </button>
        </div>
        <pre style={styles.code}>{JSON.stringify(knobs, null, 2)}</pre>
      </aside>
      <main style={styles.main}>
        <canvas ref={canvasRef} />
      </main>
    </div>
  );
};

export { PaletteLab };
