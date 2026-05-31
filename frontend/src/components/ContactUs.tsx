import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiMail, FiPhone, FiMapPin, FiSend, FiLoader } from 'react-icons/fi';
import { sendContactMessage } from '../services/contactService';
import './ContactUs.css';

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
                                {formStatus === 'error' && (
                                    <div className="contact-error-msg">
                                        {errorMessage}
                                    </div>
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
                                <button 
                                    type="submit" 
                                    className="contact-submit-btn" 
                                    disabled={formStatus === 'loading'}
                                >
                                    {formStatus === 'loading' ? (
                                        <><FiLoader className="spin" /> {t('contact_page.sending_btn', 'Sending...')}</>
                                    ) : (
                                        <>{t('contact_page.send_btn')} <FiSend /></>
                                    )}
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

