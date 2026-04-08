import React from 'react';

const HowItWorks: React.FC = () => {
    return (
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
    );
};

export default HowItWorks;
