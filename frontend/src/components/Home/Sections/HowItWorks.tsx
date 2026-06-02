import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, Variants } from 'framer-motion';

const HowItWorks: React.FC = () => {
    const { t } = useTranslation();

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <section className="how-it-works full-width-section">
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                {t('home.how_title')}
            </motion.h2>
            <motion.div 
                className="steps"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                <motion.div className="step" variants={itemVariants}>
                    <h3>{t('home.how_step1_title')}</h3>
                    <div className="step-content">
                        <li>{t('home.how_step1_l1')}</li>
                        <li>{t('home.how_step1_l2')}</li>
                        <li>{t('home.how_step1_l3')}</li>
                    </div>
                </motion.div>
                <motion.div className="step" variants={itemVariants}>
                    <h3>{t('home.how_step2_title')}</h3>
                    <div className="step-content">
                        <li>{t('home.how_step2_l1')}</li>
                        <li>{t('home.how_step2_l2')}</li>
                    </div>
                </motion.div>
                <motion.div className="step" variants={itemVariants}>
                    <h3>{t('home.how_step3_title')}</h3>
                    <div className="step-content">
                        <li>{t('home.how_step3_l1')}</li>
                        <li>{t('home.how_step3_l2')}</li>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default HowItWorks;
