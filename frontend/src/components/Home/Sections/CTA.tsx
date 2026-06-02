import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const CTA: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    return (
        <section className="cta">
            <motion.div 
                className="cta-content"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <motion.button 
                    className="cta-button" 
                    onClick={() => navigate('/report')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    {t('home.cta_btn')}
                </motion.button>
                <h2>{t('home.cta_title')}</h2>
                <p>{t('home.cta_text')}</p>
            </motion.div>
            <motion.div 
                className="decorative-image"
                initial={{ opacity: 0, x: 100, rotate: 10 }}
                whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            >
                <img src="/assets/image/Eshli.png" alt="Decorative Cat" />
            </motion.div>
        </section>
    );
};

export default CTA;
