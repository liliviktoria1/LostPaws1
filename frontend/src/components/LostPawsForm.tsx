import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/reportService';
import { PetStatus, PetSpecies, PetSex, PetAge } from '../types';
import PetCard from './Common/PetCard';
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

interface FormData {
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
    photos: File[];
}

const LostPawsForm: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
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
        contactEmail: '',
        photos: []
    });

    // Initialize Map
    useEffect(() => {
        if (!mapRef.current) {
            const initialCoords: [number, number] = [50.4501, 30.5234]; // Kyiv default
            const map = L.map('form-map').setView(initialCoords, 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            map.on('click', (e: L.LeafletMouseEvent) => {
                const { lat, lng } = e.latlng;
                updateLocation(lat, lng);
            });

            mapRef.current = map;
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const updateLocation = (lat: number, lng: number) => {
        setFormData(prev => ({ ...prev, locationLat: lat, locationLng: lng }));
        
        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else if (mapRef.current) {
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
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

    const [matches, setMatches] = useState<any[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [previews, setPreviews] = useState<string[]>([]);

    const handleDrop = (acceptedFiles: File[]) => {
        setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, ...acceptedFiles]
        }));

        const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const handleRemovePhoto = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        setFormData((prev) => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.petName || !formData.contactEmail || !formData.petStatus) {
            alert("Please fill in all required fields (Name, Email, Status)");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await reportService.createReport(formData as any);
            setMatches(response.potentialMatches || []);
            setShowSuccessModal(true);
        } catch (err: any) {
            console.error('Error submitting form:', err);
            alert("Failed to create report: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

     const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: handleDrop, accept: {'image/*': []} });

     return (
        <div className="lostpaws-form">
            <div className="form-container">
                <img
                    src="/assets/image/Dog2.png"
                    alt="Decorative Dog"
                    className="form-decorative-image"
                />
                <h2 className="form-title">{t('form.title')}</h2>

                <div className="form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-header">
                            <div className="form-group">
                            <label>{t('form.status')}:</label>
                            <div className="radio-group">
                                {[
                                    { value: 'lost', label: t('common.lost') },
                                    { value: 'found', label: t('common.found') }
                                ].map(option => (
                                    <label key={option.value}>
                                        <input
                                            type="radio"
                                            name="petStatus"
                                            value={option.value}
                                            checked={formData.petStatus === option.value}
                                            onChange={handleChange}
                                            required
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                            <label>{t('form.pet_name')}:</label>
                            <input
                                type="text"
                                name="petName"
                                value={formData.petName}
                                onChange={handleChange}
                                placeholder={t('form.pet_name')}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('form.breed')}:</label>
                            <input
                                type="text"
                                name="petBreed"
                                value={formData.petBreed}
                                onChange={handleChange}
                                placeholder={t('form.breed')}
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('form.color')}:</label>
                            <input
                                type="text"
                                name="petColor"
                                value={formData.petColor}
                                onChange={handleChange}
                                placeholder={t('form.color')}
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('form.species')}:</label>
                            <div className="radio-group">
                                {[
                                    { value: 'cat', label: t('common.cat') },
                                    { value: 'dog', label: t('common.dog') },
                                    { value: 'other', label: t('common.other') }
                                ].map(option => (
                                    <label key={option.value}>
                                        <input
                                            type="radio"
                                            name="petSpecies"
                                            value={option.value}
                                            checked={formData.petSpecies === option.value}
                                            onChange={handleChange}
                                            required
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>{t('form.age')}:</label>
                            <div className="radio-group">
                                {[
                                    { value: 'baby', label: t('common.baby') },
                                    { value: 'young', label: t('common.young') },
                                    { value: 'adult', label: t('common.adult') },
                                    { value: 'senior', label: t('common.senior') }
                                ].map(option => (
                                    <label key={option.value}>
                                        <input
                                            type="radio"
                                            name="petAge"
                                            value={option.value}
                                            checked={formData.petAge === option.value}
                                            onChange={handleChange}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>{t('form.sex')}:</label>
                            <div className="radio-group">
                                {[
                                    { value: 'female', label: t('common.female') },
                                    { value: 'male', label: t('common.male') },
                                    { value: 'unknown', label: t('common.unknown') }
                                ].map(option => (
                                    <label key={option.value}>
                                        <input
                                            type="radio"
                                            name="petSex"
                                            value={option.value}
                                            checked={formData.petSex === option.value}
                                            onChange={handleChange}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>{t('form.description')}:</label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder={t('form.description')}
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('form.photos')}:</label>
                            <div {...getRootProps()} className={`upload-area ${isDragActive ? 'active' : ''}`}>
                                <input {...getInputProps()} />
                                <div className="upload-icon">📷</div>
                                <p>{isDragActive ? "Drop here..." : t('form.upload_text')}</p>
                            </div>
                            
                            {previews.length > 0 && (
                                <div className="image-previews-container">
                                    <div className="previews-grid">
                                        {previews.map((url, index) => (
                                            <div key={index} className="preview-card">
                                                <img src={url} alt="Preview" />
                                                <button
                                                    type="button"
                                                    className="remove-preview-btn"
                                                    onClick={() => handleRemovePhoto(index)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>{t('form.location')}:</label>
                            <input
                                type="text"
                                name="locationAddress"
                                value={formData.locationAddress}
                                onChange={handleChange}
                                required
                                placeholder="Kyiv, Ukraine..."
                            />
                            
                            <div className="map-selection-container">
                                <button 
                                    type="button" 
                                    className="detect-location-btn"
                                    onClick={handleGetCurrentLocation}
                                >
                                    📍 {t('form.detect_loc')}
                                </button>
                                <div id="form-map" style={{ height: '300px', width: '100%', marginTop: '10px', borderRadius: '10px', border: '1px solid #ccc' }}></div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Date:</label>
                            <input
                                type="date"
                                name="dateLastSeen"
                                value={formData.dateLastSeen}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group contact">
                            <label>{t('form.contact_info')}:</label>
                            <input
                                type="text"
                                name="contactName"
                                value={formData.contactName}
                                onChange={handleChange}
                                placeholder={t('form.your_name')}
                            />
                            <input
                                type="text"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                placeholder={t('form.phone')}
                            />
                            <input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                placeholder={t('form.email')}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="submit-button" 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? t('common.loading') : t('form.submit')}
                        </button>
                    </form>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="success-modal">
                        <div className="modal-header">
                            <h2>{t('form.success_title')}</h2>
                            <button className="close-modal" onClick={() => navigate('/announcements')}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            <p>{t('form.success_text')}</p>
                            {matches.length > 0 && (
                                <div className="matches-grid" style={{ marginTop: '20px' }}>
                                    {matches.map((match, idx) => (
                                        <PetCard key={idx} pet={match.report} />
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => navigate('/announcements')}>{t('header.announcements')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LostPawsForm;
