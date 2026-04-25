import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CTA: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    return (
        <section className="cta">
            <div className="cta-content">
                <button className="cta-button" onClick={() => navigate('/report')}>{t('home.cta_btn')}</button>
                <h2>{t('home.cta_title')}</h2>
                <p>{t('home.cta_text')}</p>
            </div>
            <div className="decorative-image">
                <img src="/assets/image/Eshli.png" alt="Decorative Cat" />
            </div>
        </section>
    );
};

export default CTA;
