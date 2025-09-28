// /assets/js/landing-pois.js
// Load ONLY on landing.html (after map-setup.js)

(() => {
  if (!window.map || typeof L === 'undefined') return;

  const poiData = [
    // --- Philadelphia Points of Interest ---
    { name: 'Drexel University', lat: 39.9574, lng: -75.1890 },
    { name: 'University of Pennsylvania', lat: 39.9522, lng: -75.1932 },
    { name: 'Love Park', lat: 39.9540, lng: -75.1657 },
    { name: 'Rittenhouse Square', lat: 39.9494, lng: -75.1715 },
    { name: 'Old City', lat: 39.9509, lng: -75.1449 },
    { name: 'Temple University', lat: 39.9810, lng: -75.1552 },
    { name: 'Fishtown', lat: 39.9682, lng: -75.1340 },

    // --- Extra Popular Spots ---
    { name: 'Philadelphia Museum of Art', lat: 39.9656, lng: -75.1809 },
    { name: 'Reading Terminal Market', lat: 39.9533, lng: -75.1595 },
    { name: 'Liberty Bell / Independence Hall', lat: 39.9496, lng: -75.1503 },
    { name: 'Philadelphia Zoo', lat: 39.9740, lng: -75.1952 },
    { name: 'Eastern State Penitentiary', lat: 39.9681, lng: -75.1720 },
    { name: 'Franklin Institute', lat: 39.9583, lng: -75.1735 },
    { name: 'South Street', lat: 39.9417, lng: -75.1483 },
    { name: 'Spruce Street Harbor Park', lat: 39.9440, lng: -75.1413 },

    // --- More Philadelphia Points of Interest ---
    // South Philly
    { name: 'Philadelphia Sports Complex', lat: 39.9057, lng: -75.1682 },
    { name: 'Italian Market', lat: 39.9406, lng: -75.1583 },

    // Northwest Philly
    { name: 'Manayunk', lat: 40.0266, lng: -75.2239 },
    { name: 'East Falls', lat: 40.0104, lng: -75.1837 },
    { name: 'Saint Joseph’s University (Hawk Hill)', lat: 39.9942, lng: -75.2350 },

    // North/Center City Extensions
    { name: 'Jefferson University', lat: 39.9495, lng: -75.1585 },
    { name: 'Please Touch Museum', lat: 39.979511, lng: -75.209267 },
    { name: 'Laurel Hill Cemetery', lat: 40.0046, lng: -75.1836 },

    // West Philly & Beyond
    { name: 'Bartram’s Garden', lat: 39.9336, lng: -75.2147 },
    { name: 'Cobbs Creek Park', lat: 39.9501, lng: -75.2523 },

    // Riverfront & Other Cool Spots
    { name: 'Cherry Street Pier / Race Street Pier', lat: 39.9537, lng: -75.1390 },
    { name: 'Mural Arts District (Spring Garden)', lat: 39.9630, lng: -75.1580 },
    { name: 'Philadelphia Navy Yard', lat: 39.8894, lng: -75.1768 },
    { name: 'Shofuso Japanese House & Garden', lat: 39.981400, lng: -75.213577 },
  ];

  const markers = poiData.map(p =>
    L.marker([p.lat, p.lng], { title: p.name })
      .bindPopup(`<b>${p.name}</b>`)
  );

  // Create/attach the layer group
  const landingPOIs = L.layerGroup(markers).addTo(window.map);
  window.landingPOIs = landingPOIs; 
})();
