import React, { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/reportService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LostPawsForm.css';

// Fix for default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LostPawsForm = () => {
    const navigate = useNavigate();
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    
    const [isSubmitting, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
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
            const initialCoords = [50.4501, 30.5234]; // Kyiv default
            const map = L.map('form-map').setView(initialCoords, 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            map.on('click', (e) => {
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

    const updateLocation = (lat, lng) => {
        setFormData(prev => ({ ...prev, locationLat: lat, locationLng: lng }));
        
        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else {
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
        }
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                mapRef.current.setView([latitude, longitude], 15);
                updateLocation(latitude, longitude);
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDrop = (acceptedFiles) => {
        setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, ...acceptedFiles]
        }));
    };

    const handleRemovePhoto = (index) => {
        setFormData((prev) => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.petName || !formData.contactEmail || !formData.petStatus) {
            alert("Please fill in all required fields (Name, Email, Status)");
            return;
        }

        setIsLoading(true);
        try {
            await reportService.createReport(formData);
            alert("Report created successfully!");
            navigate('/announcements');
        } catch (err) {
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
                                <label>
                                    <input
                                        type="radio"
                                        name="petStatus"
                                        value="lost"
                                        checked={formData.petStatus === 'lost'}
                                        onChange={handleChange}
                                        required
                                    />
                                    Lost
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="petStatus"
                                        value="found"
                                        checked={formData.petStatus === 'found'}
                                        onChange={handleChange}
                                        required
                                    />
                                    Found / Stray
                                </label>
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
                                <label>
                                    <input
                                        type="radio"
                                        name="petSpecies"
                                        value="cat"
                                        checked={formData.petSpecies === 'cat'}
                                        onChange={handleChange}
                                        required
                                    />
                                    Cat
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="petSpecies"
                                        value="dog"
                                        checked={formData.petSpecies === 'dog'}
                                        onChange={handleChange}
                                        required
                                    />
                                    Dog
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="petSpecies"
                                        value="other"
                                        checked={formData.petSpecies === 'other'}
                                        onChange={handleChange}
                                        required
                                    />
                                    Other
                                </label>
                            </div>
                        </div>

                        {/* Pet Sex */}
                        <div className="form-group">
                            <label>Pets Sex:</label>
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="petSex"
                                        value="female"
                                        checked={formData.petSex === 'female'}
                                        onChange={handleChange}
                                    />
                                    Female
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="petSex"
                                        value="male"
                                        checked={formData.petSex === 'male'}
                                        onChange={handleChange}
                                    />
                                    Male
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="petSex"
                                        value="unknown"
                                        checked={formData.petSex === 'unknown'}
                                        onChange={handleChange}
                                    />
                                    Unknown
                                </label>
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
                                {formData.locationLat && (
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