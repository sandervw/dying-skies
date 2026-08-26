// Static faint star backdrop, seeded for a fixed field.
function random(seed) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Paints a fixed full-screen canvas of faint static stars.
 * @param {number} count Number of stars to draw.
 */
export function starfield(count = 320) {
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "fixed", inset: "0", width: "100%", height: "100%",
    zIndex: "-1", pointerEvents: "none",
  });
  document.body.appendChild(canvas);
  const draw = () => {
    const ratio = devicePixelRatio || 1;
    canvas.width = innerWidth * ratio;
    canvas.height = innerHeight * ratio;
    const context = canvas.getContext("2d");
    context.scale(ratio, ratio);
    context.fillStyle = "#000000";
    context.fillRect(0, 0, innerWidth, innerHeight);
    context.fillStyle = "#ffffff";
    const seeded = random(20260826);
    for (let index = 0; index < count; index++) {
      context.globalAlpha = 0.25 + seeded() * 0.55;
      const radius = 0.5 + seeded() * 1.1;
      context.beginPath();
      context.arc(seeded() * innerWidth, seeded() * innerHeight, radius, 0, 7);
      context.fill();
    }
  };
  draw();
  addEventListener("resize", draw);
}
