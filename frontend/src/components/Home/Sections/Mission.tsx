import React from 'react';
import { useTranslation } from 'react-i18next';

const Mission: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="mission">
            <div className="dog-image">
                <img src="/assets/image/Dog.png" alt="Dog"/>
            </div>
            <div className="mission-content">
                <h2>{t('home.mission_title')}</h2>
                <p>
                    <span className="Lost">LostPaws</span> {t('home.mission_text')}
                </p>
            </div>
        </section>
    );
};

export default Mission;
