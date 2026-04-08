import React from 'react';
import { useNavigate } from 'react-router-dom';

const CTA: React.FC = () => {
    const navigate = useNavigate();
    
    return (
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
    );
};

export default CTA;
