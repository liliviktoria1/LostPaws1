import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useDropzone, FileRejection, DropEvent } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/reportService';
import { PetStatus, PetSpecies, PetSex, PetReport, PetAge } from '../types';
import PetCard from './Common/PetCard';
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

        // Generate previews
        const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const handleRemovePhoto = (index: number) => {
        // Revoke the object URL to avoid memory leaks
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
                <h2 className="form-title">Create a Pet Alert</h2>

                <div className="form-card">
                    <form onSubmit={handleSubmit}>
                        {/* ... rest of the form ... */}
                        <div className="form-header">
                            <div className="form-group">
                            <label>Pets Status:</label>
                            <div className="radio-group">
                                {[
                                    { value: 'lost', label: 'Lost' },
                                    { value: 'found', label: 'Found / Stray' }
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

                        {/* Pet Name */}
                        <div className="form-group">
                            <label>Pets Name:</label>
                            <input
                                type="text"
                                name="petName"
                                value={formData.petName}
                                onChange={handleChange}
                                placeholder="Enter pets name"
                                required
                            />
                        </div>

                        {/* Pet Breed */}
                        <div className="form-group">
                            <label>Pets Breed:</label>
                            <input
                                type="text"
                                name="petBreed"
                                value={formData.petBreed}
                                onChange={handleChange}
                                placeholder="E.g.: Golden Retriever, Siamese, Unknown"
                            />
                        </div>

                        {/* Pet Color */}
                        <div className="form-group">
                            <label>Pets Color:</label>
                            <input
                                type="text"
                                name="petColor"
                                value={formData.petColor}
                                onChange={handleChange}
                                placeholder="E.g.: Black & White, Brown, Tricolor"
                            />
                        </div>

                        {/* Pet Species */}
                        <div className="form-group">
                            <label>Pets Species:</label>
                            <div className="radio-group">
                                {[
                                    { value: 'cat', label: 'Cat' },
                                    { value: 'dog', label: 'Dog' },
                                    { value: 'other', label: 'Other' }
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

                        {/* Pet Age */}
                        <div className="form-group">
                            <label>Pets Age (approximate):</label>
                            <div className="radio-group">
                                {[
                                    { value: 'baby', label: 'Baby / Puppy / Kitten' },
                                    { value: 'young', label: 'Young' },
                                    { value: 'adult', label: 'Adult' },
                                    { value: 'senior', label: 'Senior' }
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

                        {/* Pet Sex */}
                        <div className="form-group">
                            <label>Pets Sex:</label>
                            <div className="radio-group">
                                {[
                                    { value: 'female', label: 'Female' },
                                    { value: 'male', label: 'Male' },
                                    { value: 'unknown', label: 'Unknown' }
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

                        {/* Description */}
                        <div className="form-group">
                            <label>Description:</label>
                            <p className="sub-label">Color/Identifying Features:</p>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="E.g.: Tricolor, missing tail, small"
                            />
                        </div>

                        {/* Drag & Drop Area */}
                        <div className="form-group">
                            <label>Add photos:</label>
                            <p className="sub-label">Upload 2-5 photos from different perspectives</p>
                            <div {...getRootProps()} className={`upload-area ${isDragActive ? 'active' : ''}`}>
                                <input {...getInputProps()} />
                                <div className="upload-icon">📷</div>
                                <p>{isDragActive ? "Drop files here..." : "Drag & Drop files here"}</p>
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

                        {/* Location */}
                        <div className="form-group">
                            <label>Location last seen:</label>
                            <p className="sub-label">City, Zip, or Address</p>
                            <input
                                type="text"
                                name="locationAddress"
                                value={formData.locationAddress}
                                onChange={handleChange}
                                required
                            />
                            
                            <div className="map-selection-container">
                                <p className="sub-label">Or pin the location on the map:</p>
                                <button 
                                    type="button" 
                                    className="detect-location-btn"
                                    onClick={handleGetCurrentLocation}
                                >
                                    📍 Detect My Location
                                </button>
                                <div id="form-map" style={{ height: '300px', width: '100%', marginTop: '10px', borderRadius: '10px', border: '1px solid #ccc' }}></div>
                                {formData.locationLat !== null && formData.locationLng !== null && (
                                    <p className="coords-display">
                                        Pinned: {formData.locationLat.toFixed(4)}, {formData.locationLng.toFixed(4)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Date */}
                        <div className="form-group">
                            <label>Date last seen:</label>
                            <p className="sub-label">YYYY-MM-DD</p>
                            <input
                                type="date"
                                name="dateLastSeen"
                                value={formData.dateLastSeen}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Contact Information */}
                        <div className="form-group contact">
                            <label>Contact Information:</label>
                            <p className="sub-label">Enter your name</p>
                            <input
                                type="text"
                                name="contactName"
                                value={formData.contactName}
                                onChange={handleChange}
                                placeholder="Your Name"
                            />
                            <p className="sub-label">Enter your number</p>
                            <input
                                type="text"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                placeholder="Number"
                            />
                            <p className="sub-label">Enter your email</p>
                            <input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                placeholder="Email"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="submit-button" 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Sending..." : "Send Alert"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Success Modal with Matches */}
            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="success-modal">
                        <div className="modal-header">
                            <h2>Success! Report Created.</h2>
                            <button className="close-modal" onClick={() => navigate('/announcements')}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            {matches.length > 0 ? (
                                <>
                                    <div className="ai-match-notice">
                                        <span className="ai-sparkle">✨</span>
                                        <p>Our AI found <strong>{matches.length} potential matches</strong> for your pet!</p>
                                    </div>
                                    
                                    <div className="matches-grid">
                                        {matches.map((match, idx) => (
                                            <div key={idx} className="match-card-wrapper">
                                                <PetCard pet={match.report} />
                                                <div className="match-score-badge">
                                                    {(match.score * 100).toFixed(0)}% Match
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p>No immediate matches found. We will notify you if a match is discovered!</p>
                            )}
                        </div>
                        
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => navigate('/announcements')}>View All Announcements</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LostPawsForm;