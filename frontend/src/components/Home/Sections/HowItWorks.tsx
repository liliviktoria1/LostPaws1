import React from 'react';
import { useTranslation } from 'react-i18next';

const HowItWorks: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="how-it-works full-width-section">
            <h2>{t('home.how_title')}</h2>
            <div className="steps">
                <div className="step">
                    <h3>{t('home.how_step1_title')}</h3>
                    <div className="step-content">
                        <li>{t('home.how_step1_l1')}</li>
                        <li>{t('home.how_step1_l2')}</li>
                        <li>{t('home.how_step1_l3')}</li>
                    </div>
                </div>
                <div className="step">
                    <h3>{t('home.how_step2_title')}</h3>
                    <div className="step-content">
                        <li>{t('home.how_step2_l1')}</li>
                        <li>{t('home.how_step2_l2')}</li>
                    </div>
                </div>
                <div className="step">
                    <h3>{t('home.how_step3_title')}</h3>
                    <div className="step-content">
                        <li>{t('home.how_step3_l1')}</li>
                        <li>{t('home.how_step3_l2')}</li>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
