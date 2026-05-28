import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { reportService } from "../services/reportService";
import { PetReport, PetFilters, PetSpecies, PetStatus } from "../types";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./Maps.css";

// Fix for default Leaflet icon paths
const DefaultIcon = L.Icon.Default as any;
delete DefaultIcon.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapFilters {
    petSpecies: PetSpecies | '';
    petStatus: PetStatus | '';
    city: string;
}

const Maps: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const mapRef = useRef<L.Map | null>(null);
    const markersGroupRef = useRef<any>(null);
    const [reports, setReports] = useState<PetReport[]>([]);
    
    // Filter State
    const [filters, setFilters] = useState<MapFilters>({
        petSpecies: '',
        petStatus: '',
        city: ''
    });

    // Intercept clicks in popups to use internal navigation (Prevents 404 on refresh in production)
    useEffect(() => {
        const handleInternalNavigation = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('view-details-link')) {
                e.preventDefault();
                const path = target.getAttribute('data-path');
                if (path) navigate(path);
            }
        };
        
        document.addEventListener('click', handleInternalNavigation);
        return () => document.removeEventListener('click', handleInternalNavigation);
    }, [navigate]);

    // Initialize Map only once
    useEffect(() => {
        if (mapRef.current === null) {
            mapRef.current = L.map("map").setView([50.4501, 30.5234], 12);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; OpenStreetMap contributors',
            }).addTo(mapRef.current);

            // Initialize Marker Cluster Group
            markersGroupRef.current = (L as any).markerClusterGroup({
                showCoverageOnHover: false,
                spiderfyOnMaxZoom: true,
                zoomToBoundsOnClick: true,
                maxClusterRadius: 50
            });
            mapRef.current.addLayer(markersGroupRef.current);
        }
    }, []);

    // Fetch and Plot when filters or map change
    useEffect(() => {
        const fetchAndPlotReports = async () => {
            if (!mapRef.current) return;

            try {
                // Remove empty strings from filters
                const activeFilters = Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== '')
                );

                const response = await reportService.getReports(activeFilters);
                const data = response.reports || [];
                setReports(data);
                
                // Clear existing markers
                markersGroupRef.current.clearLayers();

                // Add new markers
                data.forEach((report: PetReport) => {
                    if (report.locationLat && report.locationLng) {
                        const markerColor = report.petStatus === 'lost' ? 'red' : 'green';
                        
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
                        
                        let imageUrl = '/assets/image/Dog.png';
                        if (photoUrl) {
                            if (photoUrl.startsWith('http')) {
                                imageUrl = photoUrl;
                            } else if (photoUrl.startsWith('/assets')) {
                                imageUrl = photoUrl;
                            } else {
                                imageUrl = `${baseUrl}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
                            }
                        }

                        const statusText = t(`common.${report.petStatus}`).toUpperCase();

                        const colorSwatchHtml = report.petColor && report.petColor.startsWith('#') 
                            ? `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${report.petColor}; border:1px solid #ddd; margin-left:5px;"></span>`
                            : '';

                        const popupContent = `
                            <div class="map-popup">
                                <img src="${imageUrl}" alt="${report.petName}" style="width:100px; height:80px; object-fit:cover; border-radius:8px; margin-bottom:5px;"/>
                                <h3 style="margin:0; font-size:14px;">${report.petName}</h3>
                                <p style="margin:2px 0; font-weight:bold; font-size:12px; color:${markerColor === 'red' ? '#d32f2f' : '#388e3c'}; display:flex; align-items:center;">
                                    ${statusText} ${colorSwatchHtml}
                                </p>
                                <p style="margin:0; font-size:11px; color:#666;">${report.locationAddress}</p>
                                <a href="/pet/${report.id}" data-path="/pet/${report.id}" class="view-details-link" style="display:inline-block; margin-top:5px; font-size:11px; color:#181A32; font-weight:700; text-decoration:none;">${t('maps.view_details')} →</a>
                            </div>
                        `;

                        L.marker([report.locationLat, report.locationLng], { icon })
                            .bindPopup(popupContent)
                            .addTo(markersGroupRef.current);
                    }
                });

                // Auto-center map if markers exist
                if (data.length > 0 && mapRef.current) {
                    const bounds = L.latLngBounds(data.map((r: PetReport) => [r.locationLat!, r.locationLng!]));
                    mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
                }
            } catch (err) {
                console.error("Error fetching reports for map:", err);
            }
        };

        fetchAndPlotReports();
    }, [filters, t]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({ petSpecies: '', petStatus: '', city: '' });
    };

    return (
        <div className="map-page">
            <div className="map-container-main">
                <div className="map-sidebar">
                    <h2 className="sidebar-title">{t('maps.sidebar_title')}</h2>
                    
                    <div className="filter-group">
                        <label>{t('maps.species_label')}</label>
                        <select name="petSpecies" value={filters.petSpecies} onChange={handleFilterChange}>
                            <option value="">{t('maps.all_animals')}</option>
                            <option value="dog">{t('common.dog')}</option>
                            <option value="cat">{t('common.cat')}</option>
                            <option value="other">{t('common.other')}</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>{t('maps.status_label')}</label>
                        <select name="petStatus" value={filters.petStatus} onChange={handleFilterChange}>
                            <option value="">{t('maps.all_statuses')}</option>
                            <option value="lost">{t('common.lost')}</option>
                            <option value="found">{t('common.found')}</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>{t('maps.city_label')}</label>
                        <input 
                            type="text" 
                            name="city" 
                            placeholder={t('maps.city_label')} 
                            value={filters.city} 
                            onChange={handleFilterChange}
                        />
                    </div>

                    <button className="clear-filters-btn" onClick={clearFilters}>
                        {t('maps.reset_filters')}
                    </button>

                    <div className="map-stats">
                        <p>{t('maps.found_reports', { count: reports.length })}</p>
                    </div>
                </div>

                <div className="map-wrapper">
                    <div id="map"></div>
                </div>
            </div>
        </div>
    );
};

export default Maps;
