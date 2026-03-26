import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useDropzone, FileRejection, DropEvent } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/reportService';
import { PetStatus, PetSpecies, PetSex } from '../types';
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
    
    const [isSubmitting, setIsLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        petStatus: '',
        petName: '',
        petSpecies: '',
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

    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

    const handleDrop = async (acceptedFiles: File[]) => {
        setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, ...acceptedFiles]
        }));

        // Automatically analyze the first photo uploaded
        if (acceptedFiles.length > 0) {
            setIsAnalyzing(true);
            try {
                const analysis = await reportService.analyzePetImage(acceptedFiles[0]);
                
                // Update form with AI suggestions
                setFormData(prev => ({
                    ...prev,
                    petSpecies: analysis.species || prev.petSpecies,
                    petName: prev.petName || (analysis.suggestedBreed ? `Maybe a ${analysis.suggestedBreed}?` : ''),
                    description: `${analysis.suggestedBreed || ''} ${analysis.primaryColor || ''} ${analysis.distinctiveFeatures || ''}`.trim()
                }));
                alert("AI has suggested some details based on your photo!");
            } catch (err) {
                console.error("AI Auto-fill failed:", err);
            } finally {
                setIsAnalyzing(false);
            }
        }
    };

    const handleRemovePhoto = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.petName || !formData.contactEmail || !formData.petStatus) {
            alert("Please fill in all required fields (Name, Email, Status)");
            return;
        }

        setIsLoading(true);
        try {
            await reportService.createReport(formData as any);
            alert("Report created successfully!");
            navigate('/announcements');
        } catch (err: any) {
            console.error('Error submitting form:', err);
            alert("Failed to create report: " + err.message);
        } finally {
            setIsLoading(false);
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
                            <label>Add a photo:</label>
                            <p className="sub-label">2-5 photo from a different perspective</p>
                            <div {...getRootProps()} className={`upload-area ${isDragActive ? 'active' : ''}`}>
                                <input {...getInputProps()} />
                                <div className="upload-icon">📷</div>
                                <p>{isDragActive ? "Drop files here..." : "Drag & Drop files here"}</p>
                            </div>
                            {formData.photos && formData.photos.length > 0 && (
                                <ul className="file-list">
                                    {formData.photos.map((file, index) => (
                                        <li key={index} className="file-item">{file.name}
                                            <button
                                                type="button"
                                                className="remove-button"
                                                onClick={() => handleRemovePhoto(index)}
                                            >
                                                ❌
                                            </button>
                                        </li>
                                    ))}
                                </ul>
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
        </div>
    );
};

export default LostPawsForm;