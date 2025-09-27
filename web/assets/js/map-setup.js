export function bootMap() {
  const el = document.getElementById('map');
  if (!el) return;

  const PHILLY = [39.9526, -75.1652];
  const map = L.map(el).setView(PHILLY, 12);
  L.control.scale().addTo(map);

  const cartoLight = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png',
    { attribution: '&copy; OSM & CARTO', subdomains: 'abcd', maxZoom: 19 }
  ).addTo(map);

  const cartoVoyager = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    { attribution: '&copy; OSM & CARTO', subdomains: 'abcd', maxZoom: 19 }
  );

  L.control.layers({
    "CARTO Light (clean)": cartoLight,
    "CARTO Voyager (colorful)": cartoVoyager
  }, null, { collapsed:false }).addTo(map);

  // Example marker
  L.marker([39.9526, -75.1639]).addTo(map).bindPopup("<b>Philadelphia City Hall</b>");
  return map;
}
