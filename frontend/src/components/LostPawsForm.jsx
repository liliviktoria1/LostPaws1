import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './LostPawsForm.css';

const LostPawsForm = () => {
    const [formData, setFormData] = useState({
        petStatus: '',
        petName: '',
        petSpecies: '',
        petSex: '',
        description: '',
        location: '',
        dateLastSeen: '',
        contactName: '',
        contactNumber: '',
        contactEmail: '',
        photos: []
    });

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
            photos: prev.photos.filter((_, i) => i !== index) // Видаляємо файл за індексом
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.petName || !formData.contactEmail) {
            alert("Будь ласка, заповніть усі обов'язкові поля");
            return;
        }
        console.log('Форма відправлена:', formData);
    };

     const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: handleDrop });

     return (
        <div className="lostpaws-form">
            {/* Main Form */}
            <div className="form-container">
                <img
                    src="/assets/image/Dog2.png" // Замініть на ваш шлях до зображення
                    alt="Decorative Dog"
                    className="form-decorative-image"
                />
                <h2 className="form-title">Create a Pet Alert</h2>

                <div className="form-card">
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
                                />
                                Found / Stray
                            </label>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Pet Name */}
                        <div className="form-group">
                            <label>Pets Name:</label>
                            <input
                                type="text"
                                name="petName"
                                value={formData.petName}
                                onChange={handleChange}
                                placeholder="Enter pets name"
                            />
                        </div>
                        <br/>
                        <br/>

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
                                    />
                                    Other
                                </label>
                            </div>
                        </div>
                        <br/>
                        <br/>
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
                        <br/>
                        <br/>
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
                        <br/>
                        <br/>
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
                        <br/>
                        <br/>
                        {/* Location */}
                        <div className="form-group">
                            <label>Location last seen:</label>
                            <p className="sub-label">City, Zip, or Address</p>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>
                        <br/>
                        <br/>
                        {/* Date */}
                        <div className="form-group">
                            <label>Date last seen:</label>
                            <p className="sub-label">dd.mm.yyyy</p>
                            <input
                                type="text"
                                name="dateLastSeen"
                                value={formData.dateLastSeen}
                                onChange={handleChange}
                            />
                        </div>
                        <br/>
                        <br/>
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
                                type="text"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                placeholder="Email"
                            />
                        </div>

                        <button type="submit" className="submit-button">Send Alert</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LostPawsForm;