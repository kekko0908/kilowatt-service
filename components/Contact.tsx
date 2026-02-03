import React, { useEffect, useRef } from 'react';
import { MapPin, Phone, Mail, Instagram } from 'lucide-react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Contact: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const kwLat = 40.85907735983668;
    const kwLng = 14.119065385917684;

    const map = L.map(mapRef.current, {
      center: [kwLat, kwLng],
      zoom: 17,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const kwIcon = L.divIcon({
      className: 'kw-map-pin',
      html: `
        <div class="kw-pin">KW</div>
        <div class="kw-pin-label">KILOWATT</div>
      `,
      iconSize: [64, 72],
      iconAnchor: [32, 58],
    });

    L.marker([kwLat, kwLng], { icon: kwIcon }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <footer id="contact" className="bg-black pt-20 pb-10 border-t border-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          
          {/* Info Side */}
          <div>
            <h2 className="font-display italic font-black text-4xl md:text-5xl text-white mb-8">
              CONTATTI
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="p-4 border border-gray-800 group-hover:border-neon rounded transition-colors">
                  <MapPin className="text-neon" size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold uppercase mb-1">Sede Operativa</h4>
                  <p className="text-gray-400">
                    Via Campana 233
                    <br />
                    80078 Pozzuoli, Campania
                  </p>
                  <p className="text-gray-500 text-sm">Capannone subito dopo Brass Studios.</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="p-4 border border-gray-800 group-hover:border-neon rounded transition-colors">
                  <Phone className="text-neon" size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold uppercase mb-1">Telefono</h4>
                  <p className="text-gray-400">+39 02 123 4567</p>
                  <p className="text-gray-500 text-sm">Lun - Ven: 09:00 - 18:00</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="p-4 border border-gray-800 group-hover:border-neon rounded transition-colors">
                  <Mail className="text-neon" size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold uppercase mb-1">Email</h4>
                  <p className="text-gray-400">info@kilowattservice.it</p>
                  <p className="text-gray-400">powerby@kilowattservice.it</p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <a
                href="#"
                className="p-3 bg-gray-900 text-white hover:bg-neon hover:text-black transition-all rounded-full"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://wa.me/393330000000"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-900 text-white hover:bg-neon hover:text-black transition-all rounded-full"
                aria-label="WhatsApp"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Map Side */}
          <div className="h-[400px] w-full bg-gray-900 rounded-lg overflow-hidden border border-gray-800 relative group mb-20 md:mb-12 lg:mb-0">
             <div ref={mapRef} className="h-full w-full map-invert" />
             <div className="absolute top-4 right-4 bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none">
               Mappa Interattiva
             </div>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 uppercase tracking-wider">
          <p>&copy; 2024 Kilowatt Service. Tutti i diritti riservati.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-neon">Privacy Policy</a>
            <a href="#" className="hover:text-neon">Termini di Servizio</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Contact;
