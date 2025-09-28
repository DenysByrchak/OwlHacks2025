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
        fetch('/api/receive-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude, longitude })
        })
        .then(res => res.json())
        .then(data => {
          const events = data.events;
          const list = document.getElementById('eventsList');

          if (!Array.isArray(events) || events.length === 0) {
            list.innerHTML = '<li class="event-card event-card--error">No events found 😢</li>';
            return;
          }

          list.innerHTML = '';
          events.forEach(ev => {
            const li = makeEventLI(ev); // This must be defined or imported
            list.appendChild(li);
          });
        })
        .catch(err => {
          console.error('Error fetching updated events:', err);
        });
      },
      () => {
        status.textContent = 'Unable to retrieve your location.';
      }
    );
  });
});
