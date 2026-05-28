import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { reportService } from '../services/reportService';
import { PetStatus, PetSpecies, PetSex, PetAge } from '../types';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LostPawsForm.css';

// Fix for default Leaflet icon paths
const DefaultIcon = L.Icon.Default as any;
delete DefaultIcon.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocalFormData {
    petStatus: PetStatus | '';
    petName: string;
    petSpecies: PetSpecies | '';
    petBreed: string;
    petColor: string;
    petAge: PetAge | '';
    petSex: PetSex | '';
    description: string;
    locationAddress: string;
    locationLat: number | null;
    locationLng: number | null;
    dateLastSeen: string;
    contactName: string;
    contactNumber: string;
    contactEmail: string;
}

const LostPawsForm: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formData, setFormData] = useState<LocalFormData>({
        petStatus: '',
        petName: '',
        petSpecies: '',
        petBreed: '',
        petColor: '',
        petAge: '',
        petSex: '',
        description: '',
        locationAddress: '',
        locationLat: null,
        locationLng: null,
        dateLastSeen: '',
        contactName: '',
        contactNumber: '',
        contactEmail: ''
    });

    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [existingPhotos, setExistingPhotos] = useState<any[]>([]);

    // Initialize Map and Load Data if Editing
    useEffect(() => {
        const init = async () => {
            // 1. Initialize Map
            if (!mapRef.current) {
                const initialCoords: [number, number] = [50.4501, 30.5234];
                const map = L.map('form-map').setView(initialCoords, 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                map.on('click', (e: L.LeafletMouseEvent) => {
                    const { lat, lng } = e.latlng;
                    updateLocation(lat, lng);
                });
                mapRef.current = map;
            }

            // 2. Fetch data if edit mode
            if (editId) {
                try {
                    const report = await reportService.getReportById(editId);
                    setFormData({
                        petStatus: report.petStatus,
                        petName: report.petName,
                        petSpecies: report.petSpecies,
                        petBreed: report.petBreed || '',
                        petColor: report.petColor || '',
                        petAge: report.petAge || '',
                        petSex: report.petSex || '',
                        description: report.description,
                        locationAddress: report.locationAddress,
                        locationLat: report.locationLat || null,
                        locationLng: report.locationLng || null,
                        dateLastSeen: report.dateLastSeen ? new Date(report.dateLastSeen).toISOString().split('T')[0] : '',
                        contactName: report.contactName || '',
                        contactNumber: report.contactNumber || '',
                        contactEmail: report.contactEmail
                    });
                    
                    if (report.locationLat && report.locationLng) {
                        setFormData(prev => ({ ...prev, locationLat: report.locationLat!, locationLng: report.locationLng! }));
                        markerRef.current = L.marker([report.locationLat, report.locationLng]).addTo(mapRef.current!);
                        mapRef.current?.setView([report.locationLat, report.locationLng], 15);
                    }

                    if (report.photos) {
                        setExistingPhotos(report.photos);
                    }
                } catch (err) {
                    console.error("Edit load failed:", err);
                }
            }
        };
        init();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [editId]);

    const updateLocation = async (lat: number, lng: number) => {
        setFormData(prev => ({ ...prev, locationLat: lat, locationLng: lng }));
        
        // Update Marker
        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else if (mapRef.current) {
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
        }

        // Reverse Geocoding (Lat/Lng -> Address)
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await response.json();
            
            if (data && data.address) {
                const addr = data.address;
                const city = addr.city || addr.town || addr.village || addr.hamlet || "";
                const street = addr.road || addr.street || "";
                const house = addr.house_number || "";
                
                let formatted = "";
                if (city) formatted += city;
                if (street) formatted += (formatted ? ", " : "") + street;
                if (house) formatted += " " + house;

                setFormData(prev => ({ ...prev, locationAddress: formatted || data.display_name.split(',').slice(0, 2).join(', ') }));
            }
        } catch (err) {
            console.error("Geocoding failed", err);
        }
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                if (mapRef.current) {
                    mapRef.current.setView([latitude, longitude], 15);
                    updateLocation(latitude, longitude);
                }
            });
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDrop = (acceptedFiles: File[]) => {
        const totalPhotos = photos.length + existingPhotos.length + acceptedFiles.length;
        if (totalPhotos > 20) {
            alert("Maximum 20 photos allowed per report");
            return;
        }
        setPhotos(prev => [...prev, ...acceptedFiles]);
        const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const handleRemovePhoto = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        setPhotos(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) data.append(key, value.toString());
            });
            photos.forEach(file => data.append('photos', file));

            if (editId) {
                await reportService.updateReport(editId, data);
                navigate('/my-reports');
            } else {
                await reportService.createReport(data);
                // REDIRECT IMMEDIATELY
                navigate('/announcements');
            }
        } catch (err: any) {
            console.error('Submit Error:', err);
            alert("Error: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

     const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: handleDrop, accept: {'image/*': []} });

     return (
        <div className="lostpaws-form">
            <div className="form-container">
                <img src="/assets/image/Dog2.png" alt="Decorative" className="form-decorative-image" />
                <h2 className="form-title">{editId ? t('my_reports_page.edit_btn') : t('form.title')}</h2>

                <div className="form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-header">
                            <div className="form-group">
                                <label>{t('form.status')}:</label>
                                <div className="radio-group">
                                    {['lost', 'found'].map(v => (
                                        <label key={v}><input type="radio" name="petStatus" value={v} checked={formData.petStatus === v} onChange={handleChange} required /> {t(`common.${v}`)}</label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {formData.petStatus === 'lost' && (
                            <div className="form-group">
                                <label>{t('form.pet_name')}:</label>
                                <input type="text" name="petName" value={formData.petName} onChange={handleChange} required />
                            </div>
                        )}

                        <div className="form-row-multi">
                            <div className="form-group"><label>{t('form.breed')}:</label><input type="text" name="petBreed" value={formData.petBreed} onChange={handleChange} /></div>
                            <div className="form-group"><label>{t('form.color')}:</label><input type="text" name="petColor" value={formData.petColor} onChange={handleChange} /></div>
                        </div>

                        <div className="form-row-multi">
                            <div className="form-group">
                                <label>{t('form.age')}:</label>
                                <select name="petAge" value={formData.petAge} onChange={handleChange} required>
                                    <option value="">-- {t('announcements.any_age')} --</option>
                                    {['baby', 'young', 'adult', 'senior'].map(v => (
                                        <option key={v} value={v}>{t(`common.${v}`)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{t('form.sex')}:</label>
                                <select name="petSex" value={formData.petSex} onChange={handleChange} required>
                                    <option value="">-- {t('announcements.any_sex')} --</option>
                                    {['male', 'female', 'unknown'].map(v => (
                                        <option key={v} value={v}>{t(`common.${v}`)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>{t('form.species')}:</label>
                            <div className="radio-group">
                                {['cat', 'dog', 'other'].map(v => (
                                    <label key={v}><input type="radio" name="petSpecies" value={v} checked={formData.petSpecies === v} onChange={handleChange} required /> {t(`common.${v}`)}</label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>{t('form.description')}:</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} style={{ width: '100%', borderRadius: '10px', padding: '10px' }}></textarea>
                        </div>

                        <div className="form-group">
                            <label>{t('form.photos')}:</label>
                            <div {...getRootProps()} className={`upload-area ${isDragActive ? 'active' : ''}`}>
                                <input {...getInputProps()} />
                                <div className="upload-icon">📷</div>
                                <p>{t('form.upload_text')}</p>
                            </div>
                            
                            <div className="image-previews-container">
                                <div className="previews-grid">
                                    {previews.map((url, idx) => (
                                        <div key={idx} className="preview-card">
                                            <img src={url} alt="Preview" />
                                            <button type="button" className="remove-preview-btn" onClick={() => handleRemovePhoto(idx)}>×</button>
                                        </div>
                                    ))}
                                    {editId && existingPhotos.map((p, idx) => (
                                        <div key={`ex-${idx}`} className="preview-card existing">
                                            <img src={(p.url.startsWith('/') ? (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '') + p.url : p.url)} alt="Existing" />
                                            <span className="existing-tag">Keep</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>{t('form.location')}:</label>
                            <input type="text" name="locationAddress" value={formData.locationAddress} onChange={handleChange} required placeholder="Kyiv, Ukraine..." />
                            <div className="map-selection-container">
                                <button type="button" className="detect-location-btn" onClick={handleGetCurrentLocation}>📍 {t('form.detect_loc')}</button>
                                <div id="form-map" style={{ height: '250px', width: '100%', marginTop: '10px', borderRadius: '15px', border: '1.5px solid #eee' }}></div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Date Last Seen:</label>
                            <input type="date" name="dateLastSeen" value={formData.dateLastSeen} onChange={handleChange} required />
                        </div>

                        <div className="form-group contact">
                            <label>{t('form.contact_info')}:</label>
                            <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} placeholder={t('form.email')} required />
                            <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder={t('form.phone')} />
                        </div>

                        <button type="submit" className="submit-button" disabled={isSubmitting}>
                            {isSubmitting ? t('common.loading') : (editId ? t('my_reports_page.edit_btn') : t('form.submit'))}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LostPawsForm;
