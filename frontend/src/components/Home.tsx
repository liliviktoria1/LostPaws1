import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/reportService';
import { PetReport } from '../types';
import './Home.css';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const missingSliderRef = useRef<HTMLDivElement>(null);
    const foundSliderRef = useRef<HTMLDivElement>(null);

    const [missingPets, setMissingPets] = useState<PetReport[]>([]);
    const [foundPets, setFoundPets] = useState<PetReport[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const [lostData, foundData] = await Promise.all([
                    reportService.getReports({ petStatus: 'lost' }),
                    reportService.getReports({ petStatus: 'found' })
                ]);
                // Keep top 10 for the home page slider
                setMissingPets(lostData.slice(0, 10));
                setFoundPets(foundData.slice(0, 10));
            } catch (err) {
                console.error('Error fetching pets:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPets();
    }, []);

    const getImageUrl = (pet: PetReport): string => {
        if (pet.photos && pet.photos.length > 0) {
            const photo = pet.photos[0];
            const url = typeof photo === 'string' ? photo : (photo as any).url;
            
            if (!url) return '/assets/image/Dog.png';
            if (url.startsWith('/assets')) return url;
            if (url.startsWith('http')) return url;
            return `http://localhost:8080${url}`;
        }
        return '/assets/image/Dog.png'; 
    };

    const scrollSlider = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
        if (ref.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="home">
            {/* ... rest of existing code up to Missing Pets Section ... */}
            <section className="lost-pet-section">
                <div className="lost-pet-content">
                    <h1>Lost your pet? Don’t worry</h1>
                    <h1>This site will help you find your lost family member.</h1>
                    <p>We search. We find. We reunite.</p>
                </div>
                <div className="lost-pet-images">
                    <img src="/assets/image/jeki-eshli.png" alt="Dog and cat illustration"/>
                </div>
            </section>

            <section className="mission">
                <div className="dog-image">
                    {/* Фоновий декоративний елемент */}
                    <img src="/assets/image/Dog.png" alt="Dog"/>
                </div>
                <div className="mission-content">
                    <h2>Our Mission</h2>
                    <p>
                        <span className="Lost">LostPaws</span> is an online platform for finding lost pets. We connect
                        people
                        who have lost their four-legged friends with those willing to help. Our
                        goal is to make the search process fast, convenient, and effective using
                        modern technology.
                    </p>
                </div>
            </section>

            <section className="how-it-works full-width-section">
                <h2>How It Works?</h2>
                <div className="steps">
                    <div className="step">
                        <h3>Post a Listing</h3>
                        <div className="step-content">
                            <li> Describe your pet (species, breed, distinctive features).</li>
                            <li>Add photos and the last known location.</li>
                            <li>Provide contact details.</li>
                        </div>
                    </div>
                    <div className="step">
                        <h3>Engage with the Community</h3>
                        <div className="step-content">
                            <li>Leave comments on listings ("I spotted this pet here!").</li>
                            <li>Get real-time notifications about new listings nearby.</li>
                        </div>
                    </div>
                    <div className="step">
                        <h3>Search on the Map</h3>
                        <div className="step-content">
                            <li>Browse listings in your area.</li>
                            <li>Filter by pet type, date lost, or status ("lost"/"found").</li>
                        </div>
                    </div>
                </div>
            </section>

            {/* Missing Pets Section */}
            <section className="missing-pets full-width-section">
                <h2>Missing Pets</h2>
                <p>Help get these paws home</p>
                <div className="slider-container-wrapper">
                    <button 
                        className="slider-button left"
                        onClick={() => scrollSlider(missingSliderRef, 'left')}
                    >
                        <svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>
                    </button>

                    <div className="slider-items-container" ref={missingSliderRef}>
                        {isLoading ? (
                            <p>Loading...</p>
                        ) : missingPets.length > 0 ? (
                            missingPets.map(pet => (
                                <div className="slider-item" key={pet.id}>
                                    <img src={getImageUrl(pet)} alt={pet.petName}/>
                                    <p>
                                        Name : <span className="pet-value">{pet.petName}</span><br/>
                                        Status : <span className="status-label lost">Lost</span><br/>
                                        Addresses : <span className="pet-value">{pet.locationAddress}</span>
                                    </p>
                                    <button className="view-post-btn" onClick={() => navigate(`/announcements`)}>View Post</button>
                                </div>
                            ))
                        ) : (
                            <p>No missing pets found.</p>
                        )}
                    </div>

                    <button 
                        className="slider-button right"
                        onClick={() => scrollSlider(missingSliderRef, 'right')}
                    >
                        <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
                    </button>
                </div>
            </section>

            {/* Found Pets Section */}
            <section className="found-pets full-width-section">
                <h2>Found Pets</h2>
                <p>Read about recently reunited pets.</p>
                <div className="slider-container-wrapper">
                    <button 
                        className="slider-button left"
                        onClick={() => scrollSlider(foundSliderRef, 'left')}
                    >
                        <svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>
                    </button>

                    <div className="slider-items-container" ref={foundSliderRef}>
                        {isLoading ? (
                            <p>Loading...</p>
                        ) : foundPets.length > 0 ? (
                            foundPets.map(pet => (
                                <div className="slider-item" key={pet.id}>
                                    <img src={getImageUrl(pet)} alt={pet.petName}/>
                                    <p>
                                        Name : <span className="pet-value">{pet.petName}</span><br/>
                                        Status : <span className="status-label found">Found</span><br/>
                                        Addresses : <span className="pet-value">{pet.locationAddress}</span>
                                    </p>
                                    <button className="view-post-btn" onClick={() => navigate(`/announcements`)}>View Post</button>
                                </div>
                            ))
                        ) : (
                            <p>No found pets reported.</p>
                        )}
                    </div>

                    <button 
                        className="slider-button right"
                        onClick={() => scrollSlider(foundSliderRef, 'right')}
                    >
                        <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
                    </button>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="cta">
                <div className="cta-content">
                    <button className="cta-button" onClick={() => navigate('/report')}>Submit a Pet Alert</button>
                    <h2>Find and Report Lost & Found Pets</h2>
                    <p>Fill out the advert form for search/find animals</p>
                </div>
                <div className="decorative-image">
                    <img src="/assets/image/Eshli.png" alt="Decorative Cat" />
                </div>
            </section>
        </div>
    );
};

export default Home;