'use client';
import { useEffect, useRef } from 'react';

export default function TripMap({ days, activeDay, center, zoom }) {
  const ref     = useRef(null);
  const mapRef  = useRef(null);
  const markers = useRef([]);
  const polyRef = useRef(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    import('leaflet').then(L => {
      const m = L.map(ref.current, {
        center: center || [20, 0],
        zoom:   zoom   || 3,
        scrollWheelZoom: false,
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(m);
      mapRef.current = m;
      renderMarkers(L, m, days, activeDay);
    });
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then(L => renderMarkers(L, mapRef.current, days, activeDay));
  }, [activeDay]);

  function renderMarkers(L, map, days, active) {
    markers.current.forEach(m => map.removeLayer(m));
    markers.current = [];
    if (polyRef.current) { map.removeLayer(polyRef.current); polyRef.current = null; }
    if (!days?.length) return;

    const valid = days.filter(d => d.lat && d.lng);
    if (valid.length > 1) {
      polyRef.current = L.polyline(valid.map(d => [d.lat, d.lng]), {
        color: 'var(--ink, #1a1a1a)', weight: 1.5, opacity: 0.35, dashArray: '5 5'
      }).addTo(map);
    }

    valid.forEach((day, i) => {
      const isActive = days.indexOf(day) === active;
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:${isActive?32:24}px;height:${isActive?32:24}px;
          background:${isActive?'#1a1a1a':'#fff'};
          color:${isActive?'#fff':'#1a1a1a'};
          border:2px solid #1a1a1a;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:${isActive?11:10}px;font-weight:700;
          font-family:'DM Sans',sans-serif;
          box-shadow:0 2px 8px rgba(0,0,0,0.15);
          transition:all 0.2s;
        ">${day.day}</div>`,
        iconSize: [isActive?32:24, isActive?32:24],
        iconAnchor: [isActive?16:12, isActive?16:12],
      });

      const marker = L.marker([day.lat, day.lng], { icon })
        .addTo(map)
        .bindPopup(`<strong>Day ${day.day}</strong><br/>${day.location}`);

      if (isActive) {
        marker.openPopup();
        map.flyTo([day.lat, day.lng], Math.max(map.getZoom(), 8), { duration: 0.6 });
      }
      markers.current.push(marker);
    });
  }

  return <div ref={ref} style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-md)' }} />;
}
