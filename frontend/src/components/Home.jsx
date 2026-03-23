import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
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
                        <span className="LostPaws-text">LostPaws</span> is an online platform for finding lost pets. We connect
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
                        <p>
                            <li> Describe your pet (species, breed, distinctive features).</li>
                            <li>Add photos and the last known location.</li>
                            <li>Provide contact details.</li>
                        </p>
                    </div>
                    <div className="step">
                        <h3>Engage with the Community</h3>
                        <p>
                            <li>Leave comments on listings ("I spotted this pet here!").</li>
                            <li>Get real-time notifications about new listings nearby.</li>
                        </p>
                    </div>
                    <div className="step">
                        <h3>Search on the Map</h3>
                        <p>
                            <li>Browse listings in your area.</li>
                            <li>Filter by pet type, date lost, or status ("lost"/"found").</li>
                        </p>
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

                        <div className="slider-item">
                            <img src="/assets/image/Ben.jpeg" alt="Ben"/>
                            <p>Name : Ben<br/>Status : Lost<br/>Addresses : Kiev , Yurivka , 08170</p>
                        </div>
                        <div className="slider-item">
                            <img src="/assets/image/Murka.jpeg" alt="Murka"/>
                            <p>Name : Murka<br/>Status : Lost <br/>Addresses : Lviv, Duliby , 82434</p>
                        </div>

                        <div className="slider-item">
                            <img src="/assets/image/Sharik.jpeg" alt="Sharik"/>
                            <p>Name : Sharik<br/>Status : Lost<br/>Addresses : Chernivtsi , 58000</p>
                        </div>
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

                        <div className="slider-item">
                            <img src="/assets/image/Jon.jpeg" alt="Jon"/>
                            <p>Name : Jon<br/>Status : Found<br/>Addresses : Kiev , Yurivka , 08170</p>
                        </div>
                        <div className="slider-item">
                            <img src="/assets/image/Luigi.png" alt="Luigi"/>
                            <p>Name : Luigi<br/>Status : Found <br/>Addresses : Lviv, Duliby , 82434</p>
                        </div>

                        <div className="slider-item">
                            <img src="/assets/image/Lisa.jpeg" alt="Lisa"/>
                            <p>Name : Lisa<br/>Status : Found<br/>Addresses : Chernivtsi , 58000</p>
                        </div>
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