---
title: Dying Skies
---

```js
import { starfield } from "./components/starfield.js";
starfield();
```

```js
const metrics = FileAttachment("./data/metrics.json").json();
const trends = (await FileAttachment("./data/trends.json").json())
  .map((row) => ({ ...row, event_day: new Date(row.event_day), event_count: Number(row.event_count) }));
```

<div class="hero">
  <h1>Dying Skies</h1>
</div>

<div class="grid grid-cols-4">
  <div class="card"><h2>Total Saved</h2><span class="big">${metrics.saved.toLocaleString("en-US")}</span></div>
  <div class="card"><h2>Total Destroyed</h2><span class="big">${metrics.destroyed.toLocaleString("en-US")}</span></div>
  <div class="card"><h2>Total Dead</h2><span class="big">${metrics.dead.toLocaleString("en-US")}</span></div>
  <div class="card"><h2>Total Users</h2><span class="big">${metrics.total_users.toLocaleString("en-US")}</span></div>
</div>

```js
trends.length
  ? Plot.plot({
      width,
      height: 360,
      marginLeft: 48,
      x: { label: null, type: "utc" },
      y: { label: null, grid: true, tickFormat: "d" },
      color: { domain: ["saved", "destroyed", "signup"], range: ["#ffffff", "#808080", "#b87333"] },
      marks: [
        Plot.lineY(trends, { x: "event_day", y: "event_count", stroke: "event_type", z: "event_type", curve: "step" }),
        Plot.ruleY([0])
      ]
    })
  : html`<p class="empty">No activity yet.</p>`
```

<style>
.hero { text-align: center; margin: 4rem 0 2rem; }
.hero h1 { letter-spacing: 0.1rem; }
.hero p { color: #808080; }
.card { text-align: center; }
.big { font-size: 2.4rem; font-weight: 700; }
.empty { color: #808080; text-align: center; padding: 4rem 0; }
</style>
