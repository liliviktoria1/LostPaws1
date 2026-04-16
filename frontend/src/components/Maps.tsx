import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { reportService } from "../services/reportService";
import { PetReport } from "../types";
import "./Maps.css";

// Fix for default Leaflet icon paths
const DefaultIcon = L.Icon.Default as any;
delete DefaultIcon.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Maps: React.FC = () => {
    const mapRef = useRef<L.Map | null>(null);
    const markersGroupRef = useRef<L.LayerGroup>(L.layerGroup());
    const [reports, setReports] = useState<PetReport[]>([]);

    useEffect(() => {
        // Initialize Map
        if (mapRef.current === null) {
            mapRef.current = L.map("map").setView([50.4501, 30.5234], 12);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; OpenStreetMap contributors',
            }).addTo(mapRef.current);

            markersGroupRef.current.addTo(mapRef.current);
        }

        const fetchAndPlotReports = async () => {
            try {
                const data = await reportService.getReports();
                setReports(data);
                
                // Clear existing markers
                markersGroupRef.current.clearLayers();

                // Add new markers
                data.forEach(report => {
                    if (report.locationLat && report.locationLng) {
                        const markerColor = report.petStatus === 'lost' ? 'red' : 'green';
                        
                        // Custom icon based on status
                        const icon = new L.Icon({
                            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        });

                        const photo = report.photos && report.photos.length > 0 ? report.photos[0] : null;
                        const photoUrl = typeof photo === 'string' ? photo : (photo as any)?.url;

                        const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '');
                        const imageUrl = photoUrl
                            ? (photoUrl.startsWith('/assets') ? photoUrl : `${baseUrl}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`)
                            : '/assets/image/Dog.png';

                        const popupContent = `
                            <div class="map-popup">
                                <img src="${imageUrl}" alt="${report.petName}" style="width:100px; height:auto; border-radius:8px; margin-bottom:5px;"/>
                                <h3 style="margin:0;">${report.petName}</h3>
                                <p style="margin:5px 0; font-weight:bold; color:${markerColor === 'red' ? '#d32f2f' : '#388e3c'}">
                                    ${report.petStatus.toUpperCase()}
                                </p>
                                <p style="margin:0; font-size:12px;">${report.locationAddress}</p>
                                <a href="/announcements" style="display:inline-block; margin-top:5px; font-size:12px; color:#181A32; font-weight:600;">View Details</a>
                            </div>
                        `;

                        L.marker([report.locationLat, report.locationLng], { icon })
                            .bindPopup(popupContent)
                            .addTo(markersGroupRef.current);
                    }
                });
            } catch (err) {
                console.error("Error fetching reports for map:", err);
            }
        };

        fetchAndPlotReports();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return (
        <div className="map-page">
            <div className="map-header">
                <h1>Pet Discovery Map</h1>
                <p>Browse reports in your area. Red markers are <b>Lost</b>, Green are <b>Found</b>.</p>
            </div>
            <div id="map" style={{ height: "calc(100vh - 200px)", width: "100%", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}></div>
        </div>
    );
};

export default Maps;
