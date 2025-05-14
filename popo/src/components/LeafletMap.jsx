import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LeafletMap = ({ position = [51.505, -0.09] }) => {
  useEffect(() => {
    // Initialize the map
    const map = L.map('map').setView(position, 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      detectRetina: true
    }).addTo(map);

    // Custom patrol icon
    const patrolIcon = L.icon({
      iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23E53935"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    });

    // Add marker with custom icon
    L.marker(position, { icon: patrolIcon })
      .addTo(map)
      .bindPopup(`
        <div class="map-popup">
          <h4>Patrol Location</h4>
          <p>Lat: ${position[0].toFixed(4)}</p>
          <p>Lng: ${position[1].toFixed(4)}</p>
        </div>
      `)
      .openPopup();

    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Cleanup function
    return () => {
      map.remove();
    };
  }, [position]);

  return <div id="map" style={{ height: '500px', width: '100%' }} />;
};

export default LeafletMap;