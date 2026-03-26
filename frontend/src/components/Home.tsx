import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/reportService';
import { PetReport } from '../types';
import './Home.css';

const Home: React.FC = () => {
    const navigate = useNavigate();

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
                // Keep only top 3 for the home page slider
                setMissingPets(lostData.slice(0, 3));
                setFoundPets(foundData.slice(0, 3));
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
            // If it's a local asset from public folder, return as is
            if (url.startsWith('/assets')) return url;
            // If it's a full URL, return as is
            if (url.startsWith('http')) return url;
            // Otherwise, it's a backend upload
            return `http://localhost:5000${url}`;
        }
        return '/assets/image/Dog.png'; 
    };

    return (
        <div className="home">
            {/* Lost Your Pet Section */}
            <section className="lost-pet-section">
                <div className="lost-pet-content">
                    <h1>Lost your pet? Don’t worry</h1>
                    <h1>This site will help you find your lost family member.</h1>
                    <p>We search. We find. We reunite.</p>
                </div>
                <div className="lost-pet-images">
                    {/* Decorative images */}
                    <img src="/assets/image/jeki-eshli.png" alt="Dog and cat illustration"/>
                </div>
            </section>

            {/* Our Mission Section */}
            <section className="mission lost-pet-content">
                <div className="decorative-shape">
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

            {/* How It Works Section */}
            <section className="how-it-works lost-pet-content">
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
            <section className="missing-pets lost-pet-content">
                <h2>Missing Pets</h2>
                <p>Help get these paws home</p>
                <div className="slider">
                    <div className="slider-navigation">
                        <button className="slider-button left">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
                            </svg>
                        </button>

                        {isLoading ? (
                            <p>Loading...</p>
                        ) : missingPets.length > 0 ? (
                            missingPets.map(pet => (
                                <div className="slider-item" key={pet.id}>
                                    <img src={getImageUrl(pet)} alt={pet.petName}/>
                                    <p>Name : {pet.petName}<br/>Status : Lost<br/>Addresses : {pet.locationAddress}</p>
                                </div>
                            ))
                        ) : (
                            <p>No missing pets found.</p>
                        )}

                        <button className="slider-button right">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* Found Pets Section */}
            <section className="found-pets lost-pet-content">
                <h2>Found Pets</h2>
                <p>Read about recently reunited pets.</p>
                <div className="slider">
                    <div className="slider-navigation">
                        <button className="slider-button left">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
                            </svg>
                        </button>

                        {isLoading ? (
                            <p>Loading...</p>
                        ) : foundPets.length > 0 ? (
                            foundPets.map(pet => (
                                <div className="slider-item" key={pet.id}>
                                    <img src={getImageUrl(pet)} alt={pet.petName}/>
                                    <p>Name : {pet.petName}<br/>Status : Found<br/>Addresses : {pet.locationAddress}</p>
                                </div>
                            ))
                        ) : (
                            <p>No found pets reported.</p>
                        )}

                        <button className="slider-button right">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="cta">
                <div className="cta-content">
                    <button
                        className="cta-button"
                        onClick={() => navigate('/report')}
                    >
                        Submit a Pet Alert
                    </button>
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