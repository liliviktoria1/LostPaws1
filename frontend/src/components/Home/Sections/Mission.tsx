import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Mission: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="mission">
            <motion.div 
                className="dog-image"
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <img src="/assets/image/Dog.png" alt="Dog"/>
            </motion.div>
            <motion.div 
                className="mission-content"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <h2>{t('home.mission_title')}</h2>
                <p>
                    <span className="Lost">LostPaws</span> {t('home.mission_text')}
                </p>
            </motion.div>
        </section>
    );
};

export default Mission;
