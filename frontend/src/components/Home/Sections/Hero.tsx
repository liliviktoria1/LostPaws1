import React from 'react';

const Hero: React.FC = () => {
    return (
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
    );
};

export default Hero;
