/* Unit Converter — length, weight, temperature, time, volume, speed, area */

'use strict';

App.registerTool({
  id: 'converter',
  name: 'Unit Converter',
  icon: 'converter',
  category: 'Utilities',
  desc: 'Convert length, weight, temperature, time, volume, speed, and area.',

  render(view) {
    const CATS = {
      'Length & Distance': {
        units: [
          { id: 'mm', label: 'Millimeters (mm)', f: 0.001 },
          { id: 'cm', label: 'Centimeters (cm)', f: 0.01 },
          { id: 'm', label: 'Meters (m)', f: 1 },
          { id: 'km', label: 'Kilometers (km)', f: 1000 },
          { id: 'in', label: 'Inches (in)', f: 0.0254 },
          { id: 'ft', label: 'Feet (ft)', f: 0.3048 },
          { id: 'yd', label: 'Yards (yd)', f: 0.9144 },
          { id: 'mi', label: 'Miles (mi)', f: 1609.344 },
          { id: 'nmi', label: 'Nautical miles (nmi)', f: 1852 }
        ]
      },
      'Weight & Mass': {
        units: [
          { id: 'mg', label: 'Milligrams (mg)', f: 0.000001 },
          { id: 'g', label: 'Grams (g)', f: 0.001 },
          { id: 'kg', label: 'Kilograms (kg)', f: 1 },
          { id: 't', label: 'Metric tons (t)', f: 1000 },
          { id: 'oz', label: 'Ounces (oz)', f: 0.028349523125 },
          { id: 'lb', label: 'Pounds (lb)', f: 0.45359237 },
          { id: 'st', label: 'Stones (st)', f: 6.35029318 }
        ]
      },
      'Temperature': {
        units: [
          { id: 'c', label: 'Celsius (°C)' },
          { id: 'f', label: 'Fahrenheit (°F)' },
          { id: 'k', label: 'Kelvin (K)' }
        ],
        special: true
      },
      'Time': {
        units: [
          { id: 'ms', label: 'Milliseconds (ms)', f: 0.001 },
          { id: 's', label: 'Seconds (s)', f: 1 },
          { id: 'min', label: 'Minutes (min)', f: 60 },
          { id: 'h', label: 'Hours (h)', f: 3600 },
          { id: 'd', label: 'Days (d)', f: 86400 },
          { id: 'wk', label: 'Weeks (wk)', f: 604800 }
        ]
      },
      'Volume': {
        units: [
          { id: 'ml', label: 'Milliliters (mL)', f: 0.001 },
          { id: 'l', label: 'Liters (L)', f: 1 },
          { id: 'm3', label: 'Cubic meters (m³)', f: 1000 },
          { id: 'tsp', label: 'Teaspoons (tsp)', f: 0.00492892159375 },
          { id: 'tbsp', label: 'Tablespoons (tbsp)', f: 0.01478676478125 },
          { id: 'cup', label: 'Cups (cup)', f: 0.2365882365 },
          { id: 'pt', label: 'Pints (pt)', f: 0.473176473 },
          { id: 'qt', label: 'Quarts (qt)', f: 0.946352946 },
          { id: 'gal', label: 'Gallons (gal)', f: 3.785411784 }
        ]
      },
      'Speed': {
        units: [
          { id: 'mps', label: 'Meters/second (m/s)', f: 1 },
          { id: 'kmh', label: 'Kilometers/hour (km/h)', f: 1 / 3.6 },
          { id: 'mph', label: 'Miles/hour (mph)', f: 0.44704 },
          { id: 'fts', label: 'Feet/second (ft/s)', f: 0.3048 },
          { id: 'kn', label: 'Knots (kn)', f: 0.514444444444 }
        ]
      },
      'Area': {
        units: [
          { id: 'cm2', label: 'Square centimeters (cm²)', f: 0.0001 },
          { id: 'm2', label: 'Square meters (m²)', f: 1 },
          { id: 'ha', label: 'Hectares (ha)', f: 10000 },
          { id: 'km2', label: 'Square kilometers (km²)', f: 1000000 },
          { id: 'in2', label: 'Square inches (in²)', f: 0.00064516 },
          { id: 'ft2', label: 'Square feet (ft²)', f: 0.09290304 },
          { id: 'ac', label: 'Acres (ac)', f: 4046.8564224 },
          { id: 'mi2', label: 'Square miles (mi²)', f: 2589988.110336 }
        ]
      }
    };

    const state = { cat: 'Length & Distance', from: 'm', to: 'ft' };

    view.innerHTML =
      '<div class="conv-cat-tabs" id="catTabs"></div>' +
      '<div class="card card-pad" style="max-width:640px">' +
        '<div class="conv-grid">' +
          '<div class="field" style="margin:0"><label class="label" for="convValue">Value</label><input class="input" id="convValue" type="number" step="any" placeholder="Enter a value"></div>' +
          '<div></div>' +
          '<div></div>' +
          '<div class="field" style="margin:0"><label class="label" for="convFrom">From</label><select class="select" id="convFrom"></select></div>' +
          '<button class="btn btn-secondary swap-btn" id="convSwap" aria-label="Swap units" style="margin-bottom:16px">' + icon('converter', 17) + '</button>' +
          '<div class="field" style="margin:0"><label class="label" for="convTo">To</label><select class="select" id="convTo"></select></div>' +
        '</div>' +
        '<div id="convOut"></div>' +
      '</div>';

    const catTabs = view.querySelector('#catTabs');
    const fromSel = view.querySelector('#convFrom');
    const toSel = view.querySelector('#convTo');
    const valEl = view.querySelector('#convValue');
    const outEl = view.querySelector('#convOut');

    const catDef = () => CATS[state.cat];

    function tempToC(v, unit) {
      if (unit === 'c') return v;
      if (unit === 'f') return (v - 32) * 5 / 9;
      return v - 273.15; // kelvin
    }
    function tempFromC(c, unit) {
      if (unit === 'c') return c;
      if (unit === 'f') return c * 9 / 5 + 32;
      return c + 273.15;
    }

    function convert(value, from, to) {
      const cat = catDef();
      if (cat.special) return tempFromC(tempToC(value, from), to);
      const fu = cat.units.find(u => u.id === from).f;
      const tu = cat.units.find(u => u.id === to).f;
      return value * fu / tu;
    }

    function fmtNum(v) {
      if (!isFinite(v)) return '—';
      const abs = Math.abs(v);
      if (abs !== 0 && (abs < 0.000001 || abs >= 1e12)) return v.toExponential(6);
      return String(Math.round(v * 1e8) / 1e8);
    }

    function renderTabs() {
      catTabs.innerHTML = Object.keys(CATS).map(c =>
        '<button class="conv-cat-tab' + (c === state.cat ? ' on' : '') + '" data-cat="' + esc(c) + '" type="button">' + esc(c) + '</button>').join('');
      catTabs.querySelectorAll('[data-cat]').forEach(b => b.addEventListener('click', () => {
        state.cat = b.dataset.cat;
        const u = CATS[state.cat].units;
        state.from = u[0].id;
        state.to = u[1].id;
        renderTabs(); renderUnits(); renderResult();
      }));
    }

    function renderUnits() {
      const u = catDef().units;
      fromSel.innerHTML = u.map(x => '<option value="' + x.id + '">' + esc(x.label) + '</option>').join('');
      toSel.innerHTML = u.map(x => '<option value="' + x.id + '">' + esc(x.label) + '</option>').join('');
      fromSel.value = state.from;
      toSel.value = state.to;
    }

    function renderResult() {
      const raw = valEl.value.trim();
      if (raw === '') {
        outEl.innerHTML = '<div class="conv-result muted"><span>Converted result appears here.</span></div>';
        return;
      }
      const v = parseFloat(raw);
      if (isNaN(v)) {
        outEl.innerHTML = '<p class="conv-error">Enter a valid number to convert.</p>';
        return;
      }
      const result = convert(v, state.from, state.to);
      const fromU = catDef().units.find(x => x.id === state.from).label;
      const toU = catDef().units.find(x => x.id === state.to).label;
      outEl.innerHTML =
        '<div class="conv-result"><b>' + esc(fmtNum(result)) + '</b><span>' + esc(toU) + '</span></div>' +
        '<p class="faint small mt-8">' + esc(fmtNum(v)) + ' ' + esc(fromU) + ' = ' + esc(fmtNum(result)) + ' ' + esc(toU) + '</p>';
    }

    fromSel.addEventListener('change', () => { state.from = fromSel.value; renderResult(); });
    toSel.addEventListener('change', () => { state.to = toSel.value; renderResult(); });
    valEl.addEventListener('input', renderResult);
    view.querySelector('#convSwap').addEventListener('click', () => {
      const f = state.from; state.from = state.to; state.to = f;
      renderUnits(); renderResult();
    });

    renderTabs(); renderUnits(); renderResult();
  }
});
