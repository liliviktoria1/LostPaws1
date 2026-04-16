import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reportService } from '../services/reportService';
import { PetReport } from '../types';
import PetSlider from './Common/PetSlider';
import './PetDetail.css';

// Fix for default Leaflet icon paths
const DefaultIcon = L.Icon.Default as any;
delete DefaultIcon.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PetDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [report, setReport] = useState<PetReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [otherPets, setOtherPets] = useState<PetReport[]>([]);
    const [loadingOthers, setLoadingOthers] = useState(true);
    const navigate = useNavigate();
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            if (!id) return;
            try {
                const data = await reportService.getReports();
                const found = data.find(r => r.id === id);
                if (found) {
                    setReport(found);
                }
                
                // Fetch other missing pets for the slider
                const others = await reportService.getReports({ petStatus: 'lost' });
                setOtherPets(others.filter(p => p.id !== id).slice(0, 10));
            } catch (error) {
                console.error("Error fetching pet details:", error);
            } finally {
                setLoading(false);
                setLoadingOthers(false);
            }
        };
        fetchReport();
    }, [id]);

    useEffect(() => {
        if (report && report.locationLat && report.locationLng && !mapRef.current) {
            const mapContainer = document.getElementById('pet-detail-map');
            if (mapContainer) {
                mapRef.current = L.map('pet-detail-map').setView([report.locationLat, report.locationLng], 15);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors',
                }).addTo(mapRef.current);

                const markerColor = report.petStatus === 'lost' ? 'red' : 'green';
                const customIcon = new L.Icon({
                    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                L.marker([report.locationLat, report.locationLng], { icon: customIcon })
                    .addTo(mapRef.current)
                    .bindPopup(`${report.petName} was last seen here`)
                    .openPopup();
            }
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [report]);

    const getImageUrl = (report: PetReport) => {
        if (report.photos && report.photos.length > 0) {
            const photo = report.photos[0];
            const url = typeof photo === 'string' ? photo : (photo as any).url;
            
            if (!url) return '/assets/image/Sharik.jpeg';
            if (url.startsWith('http')) return url;
            if (url.startsWith('/assets')) return url;
            const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '');
            return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
        }
        return '/assets/image/Sharik.jpeg';
    };

    if (loading) return <div className="loading-state">Loading pet details...</div>;
    if (!report) return <div className="error-state">Pet report not found.</div>;

    return (
        <div className="pet-detail-container">
            <button className="back-button" onClick={() => navigate(-1)}>
                &larr; Back to Results
            </button>
            
            <div className="pet-detail-card">
                <div className="pet-image-section">
                    <img src={getImageUrl(report)} alt={report.petName} />
                    <span className={`detail-status-badge ${report.petStatus}`}>
                        {report.petStatus.toUpperCase()}
                    </span>
                </div>

                <div className="pet-info-section">
                    <h1 className="pet-detail-title">{report.petName}</h1>
                    
                    <div className="detail-grid">
                        <div className="detail-item">
                            <span className="detail-label">Species</span>
                            <span className="detail-value">{report.petSpecies}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Sex</span>
                            <span className="detail-value">{report.petSex || 'Unknown'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Location</span>
                            <span className="detail-value">{report.locationAddress || 'No address provided'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Date {report.petStatus === 'lost' ? 'Lost' : 'Found'}</span>
                            <span className="detail-value">
                                {report.dateLastSeen ? new Date(report.dateLastSeen).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div className="description-section">
                        <h3>Description</h3>
                        <p>{report.description || "No description provided."}</p>
                    </div>

                    <div className="contact-section">
                        <h3>Contact Information</h3>
                        <div className="contact-card">
                            <p><strong>Owner:</strong> {report.contactName || 'Anonymous'}</p>
                            <p><strong>Phone:</strong> {report.contactNumber || 'N/A'}</p>
                            <p><strong>Email:</strong> {report.contactEmail}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="detail-map-section">
                <h3>Last Known Location</h3>
                <div id="pet-detail-map"></div>
            </div>

            <div className="other-pets-slider-section">
                <PetSlider 
                    title="Other Missing Pets"
                    subtitle="Help get these paws home"
                    pets={otherPets}
                    isLoading={loadingOthers}
                    emptyMessage="No other missing pets found."
                    sectionClass="other-pets-slider"
                />
            </div>
        </div>
    );
};

export default PetDetail;
