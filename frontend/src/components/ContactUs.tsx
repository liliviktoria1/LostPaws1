import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiMail, FiPhone, FiMapPin, FiSend, FiLoader } from 'react-icons/fi';
import { sendContactMessage } from '../services/contactService';
import './ContactUs.css';
import { motion, AnimatePresence } from 'framer-motion';

const ContactUs: React.FC = () => {
    const { t } = useTranslation();
    const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('loading');
        setErrorMessage('');

        try {
            await sendContactMessage(formData);
            setFormStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setFormStatus('idle'), 5000);
        } catch (error: any) {
            setFormStatus('error');
            setErrorMessage(error || 'Something went wrong. Please try again.');
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, x: -30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const rightCardVariants = {
        hidden: { opacity: 0, x: 30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.6,
                delay: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="contact-page">
            <motion.div 
                className="contact-hero"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1>{t('contact_page.title')}</h1>
                <p>{t('contact_page.subtitle')}</p>
            </motion.div>

            <div className="contact-container">
                <div className="contact-grid">
                    {/* Info Section */}
                    <motion.div 
                        className="contact-info-card"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.h2 variants={itemVariants}>{t('contact_page.info_title')}</motion.h2>
                        
                        <motion.div className="info-item" variants={itemVariants}>
                            <motion.div className="info-icon" whileHover={{ scale: 1.1, rotate: 5 }}><FiMail /></motion.div>
                            <div className="info-text">
                                <strong>{t('contact_page.email_label')}</strong>
                                <p>support@lostpaws.com</p>
                            </div>
                        </motion.div>

                        <motion.div className="info-item" variants={itemVariants}>
                            <motion.div className="info-icon" whileHover={{ scale: 1.1, rotate: 5 }}><FiPhone /></motion.div>
                            <div className="info-text">
                                <strong>{t('contact_page.phone_label')}</strong>
                                <p>+380 (50) xxx xx xx</p>
                            </div>
                        </motion.div>

                        <motion.div className="info-item" variants={itemVariants}>
                            <motion.div className="info-icon" whileHover={{ scale: 1.1, rotate: 5 }}><FiMapPin /></motion.div>
                            <div className="info-text">
                                <strong>{t('contact_page.office_label')}</strong>
                                <p>Kyiv, Ukraine <br/>Shevchenko Blvd, 10</p>
                            </div>
                        </motion.div>

                        <div className="social-links-contact">
                            {/* Decorative placeholders or links */}
                        </div>
                    </motion.div>

                    {/* Form Section */}
                    <motion.div 
                        className="contact-form-card"
                        variants={rightCardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h3>{t('contact_page.form_title')}</h3>
                        <AnimatePresence mode="wait">
                            {formStatus === 'success' ? (
                                <motion.div 
                                    key="success"
                                    className="contact-success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <motion.div 
                                        className="success-icon"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                    >
                                        ✓
                                    </motion.div>
                                    <p>{t('contact_page.success_msg')}</p>
                                </motion.div>
                            ) : (
                                <motion.form 
                                    key="form"
                                    onSubmit={handleSubmit}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {formStatus === 'error' && (
                                        <motion.div 
                                            className="contact-error-msg"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            {errorMessage}
                                        </motion.div>
                                    )}
                                    <div className="form-row">
                                        <div className="input-group">
                                            <input 
                                                type="text" 
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder={t('contact_page.name_placeholder')} 
                                                required 
                                            />
                                        </div>
                                        <div className="input-group">
                                            <input 
                                                type="email" 
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder={t('contact_page.email_placeholder')} 
                                                required 
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <input 
                                            type="text" 
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder={t('contact_page.subject_label')} 
                                            required 
                                        />
                                    </div>
                                    <div className="input-group">
                                        <textarea 
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder={t('contact_page.message_label')} 
                                            rows={5} 
                                            required
                                        ></textarea>
                                    </div>
                                    <motion.button 
                                        type="submit" 
                                        className="contact-submit-btn" 
                                        disabled={formStatus === 'loading'}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {formStatus === 'loading' ? (
                                            <><FiLoader className="spin" /> {t('contact_page.sending_btn', 'Sending...')}</>
                                        ) : (
                                            <>{t('contact_page.send_btn')} <FiSend /></>
                                        )}
                                    </motion.button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;

