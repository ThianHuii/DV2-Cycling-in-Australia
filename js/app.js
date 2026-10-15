/* Load the readable standalone chart files. Scale only the drawing when needed;
   keep selectors and sliders at their normal readable size. */
(async function () {
  const views = new Map();
  async function render(host) {
    try {
      const response = await fetch(host.dataset.spec);
      if (!response.ok) throw new Error(`Chart file returned HTTP ${response.status}`);
      const spec = await response.json();
      delete spec.title; // The same title and subtitle are written as accessible HTML above the chart.
      host.innerHTML = '';
      const result = await vegaEmbed(host, spec, {actions: false, renderer: 'svg'});
      views.set(host, result.view);
      fit(host);
    } catch (error) {
      host.innerHTML = '<p class="chart-error">This chart could not load. Please refresh the page or open its JSON link below.</p>';
      console.error(host.dataset.spec, error);
    }
  }
  function fit(host) {
    const svg = host.querySelector('svg');
    if (!svg) return;
    const width = Number(svg.getAttribute('width'));
    const height = Number(svg.getAttribute('height'));
    if (!(width > 0 && height > 0)) return;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.width = `${Math.min(width, host.clientWidth)}px`;
    svg.style.height = 'auto';
    svg.style.maxWidth = '100%';
    const embed = host.querySelector('.vega-embed');
    if (embed) embed.style.width = `${Math.min(width, host.clientWidth)}px`;
  }
  await Promise.all([...document.querySelectorAll('[data-spec]')].map(render));
  new ResizeObserver(() => views.forEach((_, host) => fit(host))).observe(document.body);
  window.chartViews = views; // Exposes views for local validation of bound interactions.
})();
