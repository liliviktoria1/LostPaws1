import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reportService } from '../services/reportService';
import { PetReport } from '../types';
import PetCard from './Common/PetCard';
import PetSlider from './Common/PetSlider';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/i18n';
import { FiMessageSquare, FiFacebook, FiTwitter, FiShare2 } from 'react-icons/fi';
import { FaTelegramPlane, FaViber } from 'react-icons/fa';
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
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const [report, setReport] = useState<PetReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [otherPets, setOtherPets] = useState<PetReport[]>([]);
    const [loadingOthers, setLoadingOthers] = useState(true);
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [deepMatches, setDeepMatches] = useState<any[] | null>(null);
    
    const navigate = useNavigate();
    const mapRef = useRef<L.Map | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchReport = async () => {
            if (!id) return;
            try {
                const found = await reportService.getReportById(id);
                if (found) {
                    setReport(found);
                    if (found.photos && found.photos.length > 0) {
                         const photo = found.photos[0];
                         const url = typeof photo === 'string' ? photo : (photo as any).url;
                         const fullUrl = url.startsWith('http') || url.startsWith('/assets') 
                            ? url 
                            : `${(process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
                         setMainImage(fullUrl);
                    }
                }
                
                const othersResponse = await reportService.getReports({ petStatus: 'lost' });
                setOtherPets((othersResponse.reports || []).filter((p: PetReport) => p.id !== id).slice(0, 10));
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
                    .bindPopup(`${report.petName} ${report.petStatus === 'lost' ? 'was last seen here' : 'was found here'}`)
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

    const handleDeepScan = async () => {
        if (!id) return;
        setIsScanning(true);
        try {
            const token = authService.getToken();
            const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');
            const response = await fetch(`${baseUrl}/reports/${id}/deep-scan`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'x-lang': i18n.language.substring(0, 2)
                }
            });
            
            if (!response.ok) throw new Error('Scan failed');
            const data = await response.json();
            setDeepMatches(data.matches);
        } catch (error) {
            console.error('Deep scan error:', error);
            alert("Failed to run deep scan. Please try again.");
        } finally {
            setIsScanning(false);
        }
    };

    const getImageUrl = (report: PetReport) => {
        if (mainImage) return mainImage;
        if (report.photos && report.photos.length > 0) {
            const photo = report.photos[0];
            const url = typeof photo === 'string' ? photo : (photo as any).url;
            if (!url) return '/assets/image/Sharik.jpeg';
            if (url.startsWith('http') || url.startsWith('/assets')) return url;
            const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '');
            return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
        }
        return '/assets/image/Sharik.jpeg';
    };

    const getThumbnailUrl = (photo: any) => {
        const url = typeof photo === 'string' ? photo : photo.url;
        if (!url) return '/assets/image/Sharik.jpeg';
        if (url.startsWith('http') || url.startsWith('/assets')) return url;
        const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '');
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const shareUrl = window.location.href;
    const shareText = report ? `${t(`common.${report.petStatus}`).toUpperCase()}: ${report.petName} (${report.petBreed}). ${t('pet_detail.share_desc')}` : "";

    const shareLinks = [
        { 
            name: 'Facebook', 
            icon: <FiFacebook />, 
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            color: '#1877F2'
        },
        { 
            name: 'Telegram', 
            icon: <FaTelegramPlane />, 
            url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
            color: '#0088cc'
        },
        { 
            name: 'Viber', 
            icon: <FaViber />, 
            url: `viber://forward?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
            color: '#7360f2'
        },
        { 
            name: 'Twitter', 
            icon: <FiTwitter />, 
            url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
            color: '#1DA1F2'
        }
    ];

    if (loading) return <div className="loading-state">{t('common.loading')}</div>;
    if (!report) return <div className="error-state">Pet report not found.</div>;

    const isOwner = user && report.userId === user.id;

    return (
        <div className="pet-detail-container">
            <button className="back-button" onClick={() => navigate(-1)}>
                &larr; {t('announcements.previous')}
            </button>
            
            <div className="pet-detail-card">
                <div className="pet-image-section">
                    <div className="main-image-container">
                        <img src={getImageUrl(report)} alt={report.petName} className="main-pet-image" />
                        <span className={`detail-status-badge ${report.petStatus}`}>
                            {t(`common.${report.petStatus}`).toUpperCase()}
                        </span>
                    </div>
                    {report.photos && report.photos.length > 1 && (
                        <div className="photos-thumbnail-grid">
                            {report.photos.map((photo, index) => {
                                const thumbUrl = getThumbnailUrl(photo);
                                return (
                                    <div key={index} className={`thumbnail-wrapper ${mainImage === thumbUrl ? 'active' : ''}`} onClick={() => {
                                        setMainImage(thumbUrl);
                                    }}>
                                        <img src={thumbUrl} alt={`${report.petName} ${index + 1}`} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="pet-info-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h1 className="pet-detail-title">{report.petName}</h1>
                        {isOwner && (
                            <button 
                                className="deep-scan-btn" 
                                onClick={handleDeepScan}
                                disabled={isScanning}
                            >
                                {isScanning ? t('pet_detail.scanning') : '✨ ' + t('pet_detail.matches_found')}
                            </button>
                        )}
                    </div>
                    
                    <div className="detail-grid">
                        <div className="detail-item">
                            <span className="detail-label">{t('form.species')}</span>
                            <span className="detail-value">{t(`common.${report.petSpecies}`)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">{t('form.breed')}</span>
                            <span className="detail-value">{report.petBreed || t('common.unknown')}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">{t('form.color')}</span>
                            <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {report.petColor || t('common.unknown')}
                                {report.petColor && report.petColor.startsWith('#') && (
                                    <span style={{ 
                                        display: 'inline-block', 
                                        width: '16px', 
                                        height: '16px', 
                                        borderRadius: '50%', 
                                        backgroundColor: report.petColor,
                                        border: '1px solid #ddd'
                                    }}></span>
                                )}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">{t('form.age')}</span>
                            <span className="detail-value">{report.petAge ? t(`common.${report.petAge}`) : t('common.unknown')}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">{t('form.sex')}</span>
                            <span className="detail-value">{report.petSex ? t(`common.${report.petSex}`) : t('common.unknown')}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">{t('form.location')}</span>
                            <span className="detail-value">{report.locationAddress || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Date {t(`common.${report.petStatus}`)}</span>
                            <span className="detail-value">
                                {report.dateLastSeen ? new Date(report.dateLastSeen).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div className="description-section">
                        <h3>{t('form.description')}</h3>
                        <p>{report.description || "N/A"}</p>
                    </div>

                    <div className="contact-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3>{t('pet_detail.contact')}</h3>
                            {!isOwner && user && (
                                <button 
                                    className="message-owner-btn"
                                    onClick={async () => {
                                        try {
                                            const conv = await chatService.startConversation(report.userId!, report.id);
                                            navigate('/chat', { state: { conversationId: conv.id } });
                                        } catch (err) {
                                            console.error("Failed to start chat", err);
                                        }
                                    }}
                                >
                                    <FiMessageSquare /> {t('pet_detail.message_owner')}
                                </button>
                            )}
                        </div>
                        <div className="contact-card">
                            <p><strong>Owner:</strong> {report.contactName || (report as any).user?.name || 'Anonymous'}</p>
                            <p><strong>Phone:</strong> {report.contactNumber || (report as any).user?.phoneNumber || 'N/A'}</p>
                            <p><strong>Email:</strong> {report.contactEmail || (report as any).user?.email || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Social Share Section */}
                    <div className="share-section">
                        <h3><FiShare2 /> {t('pet_detail.share_title')}</h3>
                        <p className="share-desc-text">{t('pet_detail.share_desc')}</p>
                        <div className="share-buttons-grid">
                            {shareLinks.map(link => (
                                <a 
                                    key={link.name} 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="share-btn"
                                    style={{ '--brand-color': link.color } as any}
                                    title={link.name}
                                >
                                    {link.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Deep Scan Results Section */}
            {deepMatches !== null && (
                <div className="deep-matches-section">
                    <h3>✨ {t('pet_detail.matches_found')}</h3>
                    {deepMatches.length > 0 ? (
                        <div className="announcements-grid" style={{ padding: 0 }}>
                            {deepMatches.map((match, idx) => (
                                <div key={idx} className="match-result-wrapper">
                                    <PetCard pet={match.report} />
                                    <div className="ai-reasoning-bubble">
                                        <p><strong>💡 AI:</strong> {match.reasoning}</p>
                                        <span className="match-score-pill">{(match.score * 100).toFixed(0)}% Match</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-matches-msg">{t('pet_detail.no_matches')}</p>
                    )}
                </div>
            )}

            <div className="other-pets-slider-section">
                <PetSlider 
                    title={t('pet_detail.other_missing')}
                    subtitle={t('home.missing_pets_sub')}
                    pets={otherPets}
                    isLoading={loadingOthers}
                    emptyMessage={t('home.missing_pets_empty')}
                    sectionClass="other-pets-slider"
                />
            </div>
            
            {isScanning && (
                <div className="scan-overlay">
                    <div className="scan-modal">
                        <div className="scan-spinner"></div>
                        <h3>{t('pet_detail.scanning')}</h3>
                        <p>{t('pet_detail.scanning_desc', { defaultValue: 'Our AI is visually comparing photos across the database.' })}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PetDetail;
