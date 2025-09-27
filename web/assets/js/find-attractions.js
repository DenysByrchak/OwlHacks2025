// find-attractions.js
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('findAttractionsBtn');
  const status = document.getElementById('locationStatus');

  if (!btn) return; // Button not found on this page

  btn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      status.textContent = 'Geolocation is not supported by your browser.';
      return;
    }

    status.textContent = 'Locating…';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        status.textContent = `Your location: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        
        if (window.map) {
          window.map.flyTo([latitude, longitude], 13);

          // Optional: drop a marker at the user’s location
          L.marker([latitude, longitude])
            .addTo(window.map)
            .bindPopup('You are here!')
            .openPopup();
        } else {
          console.error('Map not available on this page.');
        }

        // For now just log coords — later you can call an API for nearby attractions
        console.log(`User is at: ${latitude}, ${longitude}`);
      },
      () => {
        status.textContent = 'Unable to retrieve your location.';
      }
    );
  });
});
