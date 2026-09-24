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

<div class="grid grid-cols-1">
  <div class="card">
    <h2>Users</h2>

```js
const signupTrends = trends.filter((d) => d.event_type === "signup");
display(signupTrends.length
  ? Plot.plot({
      width,
      height: 200,
      marginLeft: 48,
      x: { label: null, type: "utc" },
      y: { label: null, grid: true, tickFormat: "d", ticks: Math.min(d3.sum(signupTrends, (d) => d.event_count), 5) },
      marks: [
        Plot.lineY(signupTrends, Plot.mapY("cumsum", { x: "event_day", y: "event_count", stroke: "#b87333", curve: "step-after" })),
        Plot.ruleY([0])
      ]
    })
  : html`<p class="empty">No activity yet.</p>`)
```

  </div>
  <div class="card">
    <h2>Saved Skies</h2>

```js
const savedTrends = trends.filter((d) => d.event_type === "saved");
display(savedTrends.length
  ? Plot.plot({
      width,
      height: 200,
      marginLeft: 48,
      x: { label: null, type: "utc" },
      y: { label: null, grid: true, tickFormat: "d", ticks: Math.min(d3.sum(savedTrends, (d) => d.event_count), 5) },
      marks: [
        Plot.lineY(savedTrends, Plot.mapY("cumsum", { x: "event_day", y: "event_count", stroke: "#ffffff", curve: "step-after" })),
        Plot.ruleY([0])
      ]
    })
  : html`<p class="empty">No activity yet.</p>`)
```

  </div>
  <div class="card">
    <h2>Destroyed Skies</h2>

```js
const destroyedTrends = trends.filter((d) => d.event_type === "destroyed");
display(destroyedTrends.length
  ? Plot.plot({
      width,
      height: 200,
      marginLeft: 48,
      x: { label: null, type: "utc" },
      y: { label: null, grid: true, tickFormat: "d", ticks: Math.min(d3.sum(destroyedTrends, (d) => d.event_count), 5) },
      marks: [
        Plot.lineY(destroyedTrends, Plot.mapY("cumsum", { x: "event_day", y: "event_count", stroke: "#808080", curve: "step-after" })),
        Plot.ruleY([0])
      ]
    })
  : html`<p class="empty">No activity yet.</p>`)
```

  </div>
</div>

<style>
.hero { text-align: center; margin: 4rem 0 2rem; }
.hero h1 { letter-spacing: 0.1rem; }
.hero p { color: #808080; }
.card { text-align: center; }
.big { font-size: 2.4rem; font-weight: 700; }
.empty { color: #808080; text-align: center; padding: 4rem 0; }
</style>
