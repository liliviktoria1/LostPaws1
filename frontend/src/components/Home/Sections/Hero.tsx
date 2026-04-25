import React from 'react';
import { useTranslation } from 'react-i18next';

const Hero: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="lost-pet-section">
            <div className="lost-pet-content">
                <h1>{t('home.hero_h1_main')}</h1>
                <h1>{t('home.hero_h1_sub')}</h1>
                <p>{t('home.hero_p')}</p>
            </div>
            <div className="lost-pet-images">
                <img src="/assets/image/jeki-eshli.png" alt="Dog and cat illustration"/>
            </div>
        </section>
    );
};

export default Hero;
