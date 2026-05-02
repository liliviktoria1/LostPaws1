import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { PetReport } from '../types';
import PetCard from './Common/PetCard';
import { useTranslation } from 'react-i18next';
import './Announcements.css'; // Reuse grid styles

const SuccessStories: React.FC = () => {
    const { t } = useTranslation();
    const [reports, setReports] = useState<PetReport[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchSuccessStories = async () => {
            setIsLoading(true);
            try {
                // Fetch only reunited pets
                const response = await reportService.getReports({ isReunited: 'true' as any });
                setReports(response.reports);
            } catch (err) {
                console.error("Error fetching success stories:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSuccessStories();
    }, []);

    return (
        <div className="announcements-page success-stories-page">
            <div className="announcements-container-main">
                <main className="announcements-content" style={{ width: '100%', flex: 'none' }}>
                    <header className="content-header centered">
                        <div className="title-area">
                            <h1>🎉 {t('success_stories_page.title')}</h1>
                            <p>{t('success_stories_page.subtitle')}</p>
                        </div>
                    </header>

                    {isLoading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>{t('common.loading')}</p>
                        </div>
                    ) : (
                        <div className="announcements-grid">
                            {reports.length > 0 ? (
                                reports.map((report) => (
                                    <PetCard key={report.id} pet={report} />
                                ))
                            ) : (
                                <div className="no-reports-box">
                                    <p className="no-reports">{t('success_stories_page.empty_text')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SuccessStories;
