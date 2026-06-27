import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import StarRating from './StarRating';

// Fix icônes Leaflet — utilise les assets du package local (pas unpkg)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && !(center[0] === 12.2383 && center[1] === -1.5616)) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function MapView({ commerces = [], center = [12.2383, -1.5616], onMarkerClick }) {
  const safeCenter = (center[0] === 0 && center[1] === 0) ? [12.2383, -1.5616] : center;
  const defaultZoom = (safeCenter[0] === 12.2383 && safeCenter[1] === -1.5616) ? 6 : 13;

  return (
    <div className="h-full w-full min-h-[400px] rounded-xl overflow-hidden shadow-inner">
      <MapContainer
        center={safeCenter}
        zoom={defaultZoom}
        minZoom={2}
        maxZoom={18}
        className="h-full w-full"
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
        zoomControl={true}
      >
        <RecenterMap center={safeCenter} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {commerces.map((commerce) => {
          const { id, nom, categorie, note_moyenne, telephone, lat, lng } = commerce;
          if (!lat || !lng) return null;

          const cleanPhone = telephone ? String(telephone).replace(/\D/g, '') : '';
          const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

          return (
            <Marker key={id || `${lat}-${lng}`} position={[lat, lng]}>
              <Popup minWidth={220} maxWidth={260}>
                <div className="p-1 font-sans">
                  <h3 className="text-base font-bold m-0 leading-tight">{nom || 'Artisan'}</h3>
                  {categorie && (
                    <p className="text-xs font-semibold text-blue-600 uppercase m-0 mt-0.5 mb-2">{categorie}</p>
                  )}
                  <div className="mb-3">
                    <StarRating value={note_moyenne || 0} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {whatsappUrl && (
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#ffffff', textDecoration: 'none', display: 'block', background: '#10b981', textAlign: 'center', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        WhatsApp
                      </a>
                    )}
                    <button onClick={() => onMarkerClick && onMarkerClick(commerce)}
                      style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
                    >
                      Voir la fiche →
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
