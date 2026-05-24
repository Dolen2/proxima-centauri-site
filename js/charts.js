/* ============================================
   Proxima Centauri Site — Plotly Charts
   ============================================ */

(function () {
  'use strict';

  const PLOTLY_LAYOUT_DEFAULTS = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(26,34,53,0.6)',
    font: { family: 'Inter, sans-serif', color: '#9ca3b8', size: 12 },
    margin: { t: 30, r: 30, b: 60, l: 70 },
    xaxis: {
      gridcolor: 'rgba(255,255,255,0.05)',
      zerolinecolor: 'rgba(255,255,255,0.1)',
      tickcolor: '#6b7290',
    },
    yaxis: {
      gridcolor: 'rgba(255,255,255,0.05)',
      zerolinecolor: 'rgba(255,255,255,0.1)',
      tickcolor: '#6b7290',
    },
    hoverlabel: {
      bgcolor: '#1a2235',
      bordercolor: '#60a5fa',
      font: { color: '#e8eaf0', size: 13 },
    },
  };

  const PLOTLY_CONFIG = {
    responsive: true,
    displayModeBar: false,
  };

  // ---------- RV Curve (discovery.html) ----------
  function renderRVCurve() {
    const el = document.getElementById('rv-chart');
    if (!el) return;

    const P = 11.186;
    const K = 1.38;
    const nObs = 65;
    const noiseStd = 0.5;

    function seededRandom(seed) {
      let s = seed;
      return function () {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
      };
    }

    const rng = seededRandom(42);
    function gaussRandom() {
      let u = 0, v = 0;
      while (u === 0) u = rng();
      while (v === 0) v = rng();
      return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    const phases = [];
    const rvData = [];
    const errors = [];
    for (let i = 0; i < nObs; i++) {
      const ph = rng();
      phases.push(ph);
      const rv = K * Math.sin(2 * Math.PI * ph) + gaussRandom() * noiseStd;
      rvData.push(rv);
      errors.push(noiseStd * (0.8 + rng() * 0.4));
    }

    const modelPhase = [];
    const modelRV = [];
    for (let i = 0; i <= 200; i++) {
      const ph = i / 200;
      modelPhase.push(ph);
      modelRV.push(K * Math.sin(2 * Math.PI * ph));
    }

    const dataTrace = {
      x: phases,
      y: rvData,
      error_y: {
        type: 'data',
        array: errors,
        visible: true,
        color: 'rgba(96,165,250,0.35)',
        thickness: 1.5,
      },
      mode: 'markers',
      type: 'scatter',
      name: 'Simulated HARPS data',
      marker: { color: '#60a5fa', size: 6, opacity: 0.85 },
      hovertemplate: 'Phase: %{x:.2f}<br>RV: %{y:.2f} m/s<extra></extra>',
    };

    const modelTrace = {
      x: modelPhase,
      y: modelRV,
      mode: 'lines',
      type: 'scatter',
      name: 'Best-fit Keplerian (K = 1.38 m/s)',
      line: { color: '#f59e0b', width: 2.5 },
      hovertemplate: 'Phase: %{x:.2f}<br>RV: %{y:.2f} m/s<extra></extra>',
    };

    const layout = {
      ...PLOTLY_LAYOUT_DEFAULTS,
      xaxis: {
        ...PLOTLY_LAYOUT_DEFAULTS.xaxis,
        title: { text: 'Orbital Phase', font: { size: 13, color: '#9ca3b8' } },
        range: [0, 1],
        dtick: 0.2,
      },
      yaxis: {
        ...PLOTLY_LAYOUT_DEFAULTS.yaxis,
        title: { text: 'Radial Velocity (m/s)', font: { size: 13, color: '#9ca3b8' } },
      },
      legend: {
        x: 0.02, y: 0.98,
        bgcolor: 'rgba(26,34,53,0.8)',
        bordercolor: 'rgba(255,255,255,0.06)',
        borderwidth: 1,
        font: { size: 11 },
      },
      annotations: [
        {
          x: 0.25, y: K,
          xref: 'x', yref: 'y',
          text: 'K = 1.38 m/s',
          showarrow: true,
          arrowhead: 2,
          arrowcolor: '#f59e0b',
          ax: 50, ay: -35,
          font: { color: '#f59e0b', size: 12 },
        },
      ],
    };

    Plotly.newPlot(el, [modelTrace, dataTrace], layout, PLOTLY_CONFIG);
  }

  // ---------- Orbital Diagram (planets.html) ----------
  function renderOrbitalDiagram() {
    const el = document.getElementById('orbital-chart');
    if (!el) return;

    function orbitPoints(a, e, n) {
      const xs = [], ys = [];
      for (let i = 0; i <= n; i++) {
        const theta = (2 * Math.PI * i) / n;
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
        xs.push(r * Math.cos(theta));
        ys.push(r * Math.sin(theta));
      }
      return { x: xs, y: ys };
    }

    const planets = [
      { name: 'Proxima d', a: 0.02885, e: 0.04, color: '#34d399', size: 8 },
      { name: 'Proxima b', a: 0.04857, e: 0.02, color: '#60a5fa', size: 12 },
      { name: 'Proxima c', a: 1.489,   e: 0.04, color: '#f59e0b', size: 10 },
    ];

    const traces = [];

    traces.push({
      x: [0], y: [0],
      mode: 'markers',
      type: 'scatter',
      name: 'Proxima Centauri',
      marker: { color: '#f87171', size: 18, symbol: 'star' },
      hovertemplate: 'Proxima Centauri<extra></extra>',
    });

    planets.forEach((p) => {
      const orbit = orbitPoints(p.a, p.e, 200);
      traces.push({
        x: orbit.x,
        y: orbit.y,
        mode: 'lines',
        type: 'scatter',
        name: p.name + ' orbit',
        line: { color: p.color, width: 1.5, dash: 'dot' },
        showlegend: false,
        hoverinfo: 'skip',
      });
      traces.push({
        x: [p.a],
        y: [0],
        mode: 'markers+text',
        type: 'scatter',
        name: p.name,
        marker: { color: p.color, size: p.size },
        text: [p.name],
        textposition: 'top center',
        textfont: { color: p.color, size: 11 },
        hovertemplate: p.name + '<br>a = ' + p.a + ' AU<extra></extra>',
      });
    });

    const hzInner = 0.0423;
    const hzOuter = 0.0816;
    const hzTheta = [];
    const hzInnerX = [], hzInnerY = [], hzOuterX = [], hzOuterY = [];
    for (let i = 0; i <= 100; i++) {
      const th = (2 * Math.PI * i) / 100;
      hzInnerX.push(hzInner * Math.cos(th));
      hzInnerY.push(hzInner * Math.sin(th));
      hzOuterX.push(hzOuter * Math.cos(th));
      hzOuterY.push(hzOuter * Math.sin(th));
    }

    traces.push({
      x: hzOuterX.concat(hzInnerX.reverse()),
      y: hzOuterY.concat(hzInnerY.reverse()),
      fill: 'toself',
      fillcolor: 'rgba(52,211,153,0.08)',
      line: { color: 'rgba(52,211,153,0.25)', width: 1 },
      type: 'scatter',
      mode: 'lines',
      name: 'Habitable Zone',
      hoverinfo: 'skip',
    });

    const layout = {
      ...PLOTLY_LAYOUT_DEFAULTS,
      xaxis: {
        ...PLOTLY_LAYOUT_DEFAULTS.xaxis,
        title: { text: 'Distance (AU)', font: { size: 13, color: '#9ca3b8' } },
        scaleanchor: 'y',
        constrain: 'domain',
      },
      yaxis: {
        ...PLOTLY_LAYOUT_DEFAULTS.yaxis,
        title: { text: 'Distance (AU)', font: { size: 13, color: '#9ca3b8' } },
      },
      legend: {
        x: 0.02, y: 0.98,
        bgcolor: 'rgba(26,34,53,0.8)',
        bordercolor: 'rgba(255,255,255,0.06)',
        borderwidth: 1,
        font: { size: 11 },
      },
      shapes: [],
    };

    Plotly.newPlot(el, traces, layout, PLOTLY_CONFIG);

    el.querySelector('.plot-container').insertAdjacentHTML(
      'beforeend',
      '<p style="text-align:center;font-size:0.78rem;color:#6b7290;margin-top:0.5rem;">Note: Proxima c orbits at 1.49 AU — zoom out or pan to see its full orbit.</p>'
    );
  }

  // ---------- Inner System Zoom (planets.html) ----------
  function renderInnerSystemZoom() {
    const el = document.getElementById('inner-system-chart');
    if (!el) return;

    function orbitPoints(a, e, n) {
      const xs = [], ys = [];
      for (let i = 0; i <= n; i++) {
        const theta = (2 * Math.PI * i) / n;
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
        xs.push(r * Math.cos(theta));
        ys.push(r * Math.sin(theta));
      }
      return { x: xs, y: ys };
    }

    const planets = [
      { name: 'Proxima d', a: 0.02885, e: 0.04, color: '#34d399', size: 10 },
      { name: 'Proxima b', a: 0.04857, e: 0.02, color: '#60a5fa', size: 14 },
    ];

    const traces = [];

    traces.push({
      x: [0], y: [0],
      mode: 'markers',
      type: 'scatter',
      name: 'Proxima Centauri',
      marker: { color: '#f87171', size: 20, symbol: 'star' },
      hovertemplate: 'Proxima Centauri<extra></extra>',
    });

    const hzInner = 0.0423;
    const hzOuter = 0.0816;
    const hzInnerX = [], hzInnerY = [], hzOuterX = [], hzOuterY = [];
    for (let i = 0; i <= 100; i++) {
      const th = (2 * Math.PI * i) / 100;
      hzInnerX.push(hzInner * Math.cos(th));
      hzInnerY.push(hzInner * Math.sin(th));
      hzOuterX.push(hzOuter * Math.cos(th));
      hzOuterY.push(hzOuter * Math.sin(th));
    }

    traces.push({
      x: hzOuterX.concat([...hzInnerX].reverse()),
      y: hzOuterY.concat([...hzInnerY].reverse()),
      fill: 'toself',
      fillcolor: 'rgba(52,211,153,0.1)',
      line: { color: 'rgba(52,211,153,0.3)', width: 1 },
      type: 'scatter',
      mode: 'lines',
      name: 'Habitable Zone',
      hoverinfo: 'skip',
    });

    planets.forEach((p) => {
      const orbit = orbitPoints(p.a, p.e, 200);
      traces.push({
        x: orbit.x, y: orbit.y,
        mode: 'lines', type: 'scatter',
        name: p.name + ' orbit',
        line: { color: p.color, width: 1.5, dash: 'dot' },
        showlegend: false, hoverinfo: 'skip',
      });
      traces.push({
        x: [p.a], y: [0],
        mode: 'markers+text', type: 'scatter',
        name: p.name,
        marker: { color: p.color, size: p.size },
        text: [p.name], textposition: 'top center',
        textfont: { color: p.color, size: 12 },
        hovertemplate: p.name + '<br>a = ' + p.a + ' AU<extra></extra>',
      });
    });

    const mercuryOrbit = orbitPoints(0.387, 0.206, 200);
    traces.push({
      x: mercuryOrbit.x, y: mercuryOrbit.y,
      mode: 'lines', type: 'scatter',
      name: "Mercury's orbit (for scale)",
      line: { color: 'rgba(255,255,255,0.15)', width: 1, dash: 'dash' },
      hoverinfo: 'skip',
    });

    const layout = {
      ...PLOTLY_LAYOUT_DEFAULTS,
      xaxis: {
        ...PLOTLY_LAYOUT_DEFAULTS.xaxis,
        title: { text: 'Distance (AU)', font: { size: 13, color: '#9ca3b8' } },
        range: [-0.12, 0.12],
        scaleanchor: 'y',
      },
      yaxis: {
        ...PLOTLY_LAYOUT_DEFAULTS.yaxis,
        title: { text: 'Distance (AU)', font: { size: 13, color: '#9ca3b8' } },
        range: [-0.12, 0.12],
      },
      legend: {
        x: 0.02, y: 0.98,
        bgcolor: 'rgba(26,34,53,0.8)',
        bordercolor: 'rgba(255,255,255,0.06)',
        borderwidth: 1,
        font: { size: 11 },
      },
    };

    Plotly.newPlot(el, traces, layout, PLOTLY_CONFIG);
  }

  // ---------- Habitability Charts ----------

  function renderInsolationChart() {
    const el = document.getElementById('insolation-chart');
    if (!el) return;

    const distances = [];
    const solarFlux = [];
    const proximaFlux = [];
    for (let i = 1; i <= 200; i++) {
      const d = i * 0.01;
      distances.push(d);
      solarFlux.push(1.0 / (d * d));
      proximaFlux.push(0.0017 / (d * d));
    }

    const traces = [
      {
        x: distances, y: solarFlux,
        mode: 'lines', type: 'scatter',
        name: 'Sun',
        line: { color: '#f59e0b', width: 2 },
        hovertemplate: 'd = %{x:.2f} AU<br>S = %{y:.1f} S&#8853;<extra>Sun</extra>',
      },
      {
        x: distances, y: proximaFlux,
        mode: 'lines', type: 'scatter',
        name: 'Proxima Centauri',
        line: { color: '#f87171', width: 2 },
        hovertemplate: 'd = %{x:.2f} AU<br>S = %{y:.3f} S&#8853;<extra>Proxima</extra>',
      },
      {
        x: [0.0485], y: [0.0017 / (0.0485 * 0.0485)],
        mode: 'markers', type: 'scatter',
        name: 'Proxima b',
        marker: { color: '#60a5fa', size: 12, symbol: 'diamond' },
        hovertemplate: 'Proxima b<br>d = 0.0485 AU<br>S = %{y:.2f} S&#8853;<extra></extra>',
      },
      {
        x: [1.0], y: [1.0],
        mode: 'markers', type: 'scatter',
        name: 'Earth',
        marker: { color: '#34d399', size: 12, symbol: 'diamond' },
        hovertemplate: 'Earth<br>d = 1.0 AU<br>S = 1.0 S&#8853;<extra></extra>',
      },
    ];

    const layout = {
      ...PLOTLY_LAYOUT_DEFAULTS,
      xaxis: {
        ...PLOTLY_LAYOUT_DEFAULTS.xaxis,
        title: { text: 'Distance from Star (AU)', font: { size: 13, color: '#9ca3b8' } },
        type: 'log',
        range: [Math.log10(0.01), Math.log10(2)],
      },
      yaxis: {
        ...PLOTLY_LAYOUT_DEFAULTS.yaxis,
        title: { text: 'Insolation Flux (S&#8853;)', font: { size: 13, color: '#9ca3b8' } },
        type: 'log',
      },
      legend: {
        x: 0.65, y: 0.98,
        bgcolor: 'rgba(26,34,53,0.8)',
        bordercolor: 'rgba(255,255,255,0.06)',
        borderwidth: 1, font: { size: 11 },
      },
    };

    Plotly.newPlot(el, traces, layout, PLOTLY_CONFIG);
  }

  function renderHZChart() {
    const el = document.getElementById('hz-chart');
    if (!el) return;

    function hzBounds(L) {
      var inner = Math.sqrt(L / 1.107);
      var outer = Math.sqrt(L / 0.356);
      return { inner: inner, outer: outer };
    }

    var sunHZ = hzBounds(1.0);
    var proxHZ = hzBounds(0.0017);

    var sunY = 1;
    var proxY = 0;
    var bh = 0.32;

    var shapes = [
      { type: 'rect', xref: 'x', yref: 'y',
        x0: sunHZ.inner, x1: sunHZ.outer, y0: sunY - bh, y1: sunY + bh,
        fillcolor: 'rgba(245,158,11,0.30)', line: { color: '#f59e0b', width: 2 } },
      { type: 'rect', xref: 'x', yref: 'y',
        x0: proxHZ.inner, x1: proxHZ.outer, y0: proxY - bh, y1: proxY + bh,
        fillcolor: 'rgba(248,113,113,0.30)', line: { color: '#f87171', width: 2 } },
    ];

    var traces = [
      {
        x: [1.0], y: [sunY], mode: 'markers', type: 'scatter',
        marker: { color: '#34d399', size: 13, symbol: 'diamond', line: { color: '#fff', width: 1.5 } },
        showlegend: false,
        hovertemplate: '<b>Earth</b><br>1.0 AU<extra></extra>',
      },
      {
        x: [0.0485], y: [proxY], mode: 'markers', type: 'scatter',
        marker: { color: '#60a5fa', size: 13, symbol: 'diamond', line: { color: '#fff', width: 1.5 } },
        showlegend: false,
        hovertemplate: '<b>Proxima b</b><br>0.0485 AU<extra></extra>',
      },
    ];

    var mid = (sunHZ.inner + sunHZ.outer) / 2;
    var proxMid = (proxHZ.inner + proxHZ.outer) / 2;

    var annotations = [
      { x: sunHZ.inner, y: sunY + bh + 0.15, text: sunHZ.inner.toFixed(2) + ' AU',
        font: { color: '#d4a34a', size: 11 }, xanchor: 'center', showarrow: false },
      { x: sunHZ.outer, y: sunY + bh + 0.15, text: sunHZ.outer.toFixed(2) + ' AU',
        font: { color: '#d4a34a', size: 11 }, xanchor: 'center', showarrow: false },
      { x: mid, y: sunY, text: '<b>Sun HZ</b>',
        font: { color: '#f59e0b', size: 13 }, xanchor: 'center', showarrow: false },
      { x: 1.0, y: sunY - bh - 0.14, text: '◆ Earth',
        font: { color: '#34d399', size: 11 }, xanchor: 'center', showarrow: false },

      { x: proxMid, y: proxY, text: '<b>Proxima HZ</b>',
        font: { color: '#f87171', size: 11 }, xanchor: 'left', xshift: 18, showarrow: false },
      { x: 0.0485, y: proxY - bh - 0.14, text: '◆ Proxima b',
        font: { color: '#60a5fa', size: 11 }, xanchor: 'center', showarrow: false },

      { x: proxMid, y: proxY + bh + 0.15,
        text: proxHZ.inner.toFixed(3) + ' – ' + proxHZ.outer.toFixed(3) + ' AU',
        font: { color: '#e87979', size: 10 }, xanchor: 'center', showarrow: false },

      { x: 0.30, y: proxY + bh + 0.42,
        text: '← Proxima\'s entire HZ fits in 0.03 AU',
        font: { color: 'rgba(255,255,255,0.4)', size: 11, family: 'Inter, sans-serif' },
        xanchor: 'left', showarrow: true,
        ax: -45, ay: 0, arrowcolor: 'rgba(255,255,255,0.2)', arrowwidth: 1, arrowhead: 2 },
    ];

    annotations.forEach(function (a) {
      a.xref = 'x';
      a.yref = 'y';
    });

    var layout = {
      ...PLOTLY_LAYOUT_DEFAULTS,
      height: 320,
      margin: { t: 20, b: 50, l: 30, r: 30 },
      xaxis: {
        ...PLOTLY_LAYOUT_DEFAULTS.xaxis,
        title: { text: 'Distance from Star (AU)', font: { size: 13, color: '#9ca3b8' } },
        range: [0, 1.85],
        dtick: 0.2,
      },
      yaxis: {
        ...PLOTLY_LAYOUT_DEFAULTS.yaxis,
        showticklabels: false,
        showgrid: false,
        zeroline: false,
        range: [-0.75, 1.75],
        fixedrange: true,
      },
      shapes: shapes,
      annotations: annotations,
      showlegend: false,
    };

    Plotly.newPlot(el, traces, layout, PLOTLY_CONFIG);
  }

  function renderTeqChart() {
    const el = document.getElementById('teq-chart');
    if (!el) return;

    const albedos = [];
    const teqProxB = [];
    const teqEarth = [];
    const Lprox = 0.0017;
    const LEarth = 1.0;
    const dProxB = 0.0485;
    const dEarth = 1.0;
    const Tsun = 5778;
    const Rsun = 1.0;
    const Tprox = 3042;
    const Rprox = 0.154;

    for (let i = 0; i <= 100; i++) {
      const A = i / 100;
      albedos.push(A);
      const SProx = Lprox / (dProxB * dProxB);
      const SEarth = LEarth / (dEarth * dEarth);
      const S0 = 1361;
      const teqP = 278.5 * Math.pow(SProx * (1 - A), 0.25);
      const teqE = 278.5 * Math.pow(SEarth * (1 - A), 0.25);
      teqProxB.push(teqP);
      teqEarth.push(teqE);
    }

    const traces = [
      {
        x: albedos, y: teqEarth,
        mode: 'lines', type: 'scatter',
        name: 'Earth',
        line: { color: '#34d399', width: 2 },
        hovertemplate: 'Albedo = %{x:.2f}<br>T_eq = %{y:.0f} K<extra>Earth</extra>',
      },
      {
        x: albedos, y: teqProxB,
        mode: 'lines', type: 'scatter',
        name: 'Proxima b',
        line: { color: '#60a5fa', width: 2 },
        hovertemplate: 'Albedo = %{x:.2f}<br>T_eq = %{y:.0f} K<extra>Proxima b</extra>',
      },
      {
        x: [0.3], y: [278.5 * Math.pow(1.0 * 0.7, 0.25)],
        mode: 'markers', type: 'scatter',
        name: 'Earth (A=0.3)',
        marker: { color: '#34d399', size: 10, symbol: 'diamond' },
        hovertemplate: 'Earth actual<br>A = 0.3, T_eq = %{y:.0f} K<extra></extra>',
      },
      {
        x: [0.3], y: [278.5 * Math.pow(0.0017 / (0.0485 * 0.0485) * 0.7, 0.25)],
        mode: 'markers', type: 'scatter',
        name: 'Proxima b (A=0.3)',
        marker: { color: '#60a5fa', size: 10, symbol: 'diamond' },
        hovertemplate: 'Proxima b (Earth-like albedo)<br>A = 0.3, T_eq = %{y:.0f} K<extra></extra>',
      },
    ];

    const layout = {
      ...PLOTLY_LAYOUT_DEFAULTS,
      xaxis: {
        ...PLOTLY_LAYOUT_DEFAULTS.xaxis,
        title: { text: 'Bond Albedo', font: { size: 13, color: '#9ca3b8' } },
        range: [0, 1],
      },
      yaxis: {
        ...PLOTLY_LAYOUT_DEFAULTS.yaxis,
        title: { text: 'Equilibrium Temperature (K)', font: { size: 13, color: '#9ca3b8' } },
      },
      shapes: [
        {
          type: 'rect',
          x0: 0, x1: 1, y0: 273, y1: 373,
          fillcolor: 'rgba(52,211,153,0.06)',
          line: { width: 0 },
          layer: 'below',
        },
      ],
      annotations: [
        {
          x: 0.92, y: 323,
          text: 'Liquid water<br>range',
          showarrow: false,
          font: { color: 'rgba(52,211,153,0.5)', size: 11 },
        },
      ],
      legend: {
        x: 0.6, y: 0.98,
        bgcolor: 'rgba(26,34,53,0.8)',
        bordercolor: 'rgba(255,255,255,0.06)',
        borderwidth: 1, font: { size: 11 },
      },
    };

    Plotly.newPlot(el, traces, layout, PLOTLY_CONFIG);
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', () => {
    renderRVCurve();
    renderOrbitalDiagram();
    renderInnerSystemZoom();
    renderInsolationChart();
    renderHZChart();
    renderTeqChart();
  });
})();
