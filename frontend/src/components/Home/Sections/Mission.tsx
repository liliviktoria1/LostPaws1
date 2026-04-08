import React from 'react';

const Mission: React.FC = () => {
    return (
        <section className="mission">
            <div className="dog-image">
                <img src="/assets/image/Dog.png" alt="Dog"/>
            </div>
            <div className="mission-content">
                <h2>Our Mission</h2>
                <p>
                    <span className="Lost">LostPaws</span> is an online platform for finding lost pets. We connect
                    people who have lost their four-legged friends with those willing to help. Our
                    goal is to make the search process fast, convenient, and effective using
                    modern technology.
                </p>
            </div>
        </section>
    );
};

export default Mission;
