import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import './ContactUs.css';

const ContactUs: React.FC = () => {
    const { t } = useTranslation();
    const [formStatus, setFormStatus] = useState<'idle' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock submission
        setFormStatus('success');
        setTimeout(() => setFormStatus('idle'), 5000);
    };

    return (
        <div className="contact-page">
            <div className="contact-hero">
                <h1>{t('contact_page.title')}</h1>
                <p>{t('contact_page.subtitle')}</p>
            </div>

            <div className="contact-container">
                <div className="contact-grid">
                    {/* Info Section */}
                    <div className="contact-info-card">
                        <h2>{t('contact_page.info_title')}</h2>
                        
                        <div className="info-item">
                            <div className="info-icon"><FiMail /></div>
                            <div className="info-text">
                                <strong>{t('contact_page.email_label')}</strong>
                                <p>support@lostpaws.com</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon"><FiPhone /></div>
                            <div className="info-text">
                                <strong>{t('contact_page.phone_label')}</strong>
                                <p>+380 (50) xxx xx xx</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon"><FiMapPin /></div>
                            <div className="info-text">
                                <strong>{t('contact_page.office_label')}</strong>
                                <p>Kyiv, Ukraine <br/>Shevchenko Blvd, 10</p>
                            </div>
                        </div>

                        <div className="social-links-contact">
                            {/* Decorative placeholders or links */}
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="contact-form-card">
                        <h3>{t('contact_page.form_title')}</h3>
                        {formStatus === 'success' ? (
                            <div className="contact-success animate-in">
                                <div className="success-icon">✓</div>
                                <p>{t('contact_page.success_msg')}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="input-group">
                                        <input type="text" placeholder={t('contact_page.name_placeholder')} required />
                                    </div>
                                    <div className="input-group">
                                        <input type="email" placeholder={t('contact_page.email_placeholder')} required />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <input type="text" placeholder={t('contact_page.subject_label')} required />
                                </div>
                                <div className="input-group">
                                    <textarea placeholder={t('contact_page.message_label')} rows={5} required></textarea>
                                </div>
                                <button type="submit" className="contact-submit-btn">
                                    {t('contact_page.send_btn')} <FiSend />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
