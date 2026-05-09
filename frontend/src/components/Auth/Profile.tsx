import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { User } from '../../types';
import { useTranslation } from 'react-i18next';
import { FiUser, FiPhone, FiMail, FiLock, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import './Profile.css';

const Profile: React.FC = () => {
    const { t } = useTranslation();
    const [profile, setProfile] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        password: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await authService.getProfile();
                setProfile(data);
                setFormData({
                    name: data.name,
                    phoneNumber: data.phoneNumber || '',
                    password: ''
                });
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const updateData: any = { name: formData.name, phoneNumber: formData.phoneNumber };
            if (formData.password) updateData.password = formData.password;
            
            await authService.updateProfile(updateData);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 4000);
        } catch (err) {
            alert("Update failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="loading-state">{t('common.loading')}</div>;
    if (!profile) return null;

    return (
        <div className="profile-page-container">
            <div className="profile-card">
                <header className="profile-header">
                    <div className="profile-avatar-large">
                        {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-title-area">
                        <h1>{t('profile_page.title')}</h1>
                        <p>{t('profile_page.subtitle')}</p>
                    </div>
                </header>

                <div className="profile-content-grid">
                    {/* Left: Summary */}
                    <aside className="profile-summary">
                        <div className="summary-item">
                            <FiMail />
                            <div>
                                <label>{t('profile_page.email_address')}</label>
                                <span>{profile.email}</span>
                            </div>
                        </div>
                        <div className="summary-item">
                            <FiCalendar />
                            <div>
                                <label>{t('profile_page.member_since')}</label>
                                <span>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </aside>

                    {/* Right: Form */}
                    <main className="profile-form-area">
                        <form onSubmit={handleSubmit}>
                            <section className="form-section">
                                <h3>{t('profile_page.personal_info')}</h3>
                                <div className="profile-input-group">
                                    <FiUser className="input-icon" />
                                    <input 
                                        type="text" 
                                        name="name"
                                        placeholder={t('profile_page.full_name')}
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="profile-input-group">
                                    <FiPhone className="input-icon" />
                                    <input 
                                        type="text" 
                                        name="phoneNumber"
                                        placeholder={t('profile_page.phone_number')}
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            </section>

                            <section className="form-section">
                                <h3>{t('profile_page.security')}</h3>
                                <div className="profile-input-group">
                                    <FiLock className="input-icon" />
                                    <input 
                                        type="password" 
                                        name="password"
                                        placeholder={t('profile_page.new_password')}
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                                <p className="field-hint">{t('profile_page.password_hint')}</p>
                            </section>

                            <div className="form-actions">
                                <button type="submit" className="profile-save-btn" disabled={isSaving}>
                                    {isSaving ? t('common.loading') : t('profile_page.save_btn')}
                                </button>
                                
                                {showSuccess && (
                                    <div className="profile-success-alert">
                                        <FiCheckCircle /> {t('profile_page.success_msg')}
                                    </div>
                                )}
                            </div>
                        </form>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Profile;
