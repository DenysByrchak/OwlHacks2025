export function bootMap() {
  const el = document.getElementById('map');
  if (!el) return null;

  const PHILLY = [39.9526, -75.1652];

  // Disable default zoom so we can control order
  const map = L.map(el, { zoomControl: false }).setView(PHILLY, 12);

  // Match events page positions
  map.attributionControl.setPosition('bottomright');

  const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &amp; ' +
    '<a href="https://carto.com/attributions">CARTO</a>';
  const common = { attribution, subdomains: 'abcd', maxZoom: 19 };

  const cartoLight = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png',
    common
  ).addTo(map);

  const cartoVoyager = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    common
  );

  // Zoom ABOVE layers (same stack as events.html)

  L.control.layers(
    { 'CARTO Light (clean)': cartoLight, 'CARTO Voyager (colorful)': cartoVoyager },
    null,
    { position: 'bottomright', collapsed: false }
  ).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

  // Scale key bottom-left (same as events)
  L.control.scale({ position: 'bottomleft', metric: true, imperial: true }).addTo(map);

  // Example marker
  L.marker([39.9526, -75.1639], { title: 'Philadelphia City Hall' })
    .addTo(map)
    .bindPopup('<b>Philadelphia City Hall</b>');

  return map;
}
