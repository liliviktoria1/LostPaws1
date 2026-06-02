import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="lost-pet-section">
            <motion.div 
                className="lost-pet-content"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <h1>{t('home.hero_h1_main')}</h1>
                <h1>{t('home.hero_h1_sub')}</h1>
                <p>{t('home.hero_p')}</p>
            </motion.div>
            <motion.div 
                className="lost-pet-images"
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
                <img src="/assets/image/jeki-eshli.png" alt="Dog and cat illustration"/>
            </motion.div>
        </section>
    );
};

export default Hero;
