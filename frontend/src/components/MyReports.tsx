import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/reportService';
import { PetReport } from '../types';
import PetCard from './Common/PetCard';
import { useAuth } from '../context/AuthContext';
import './MyReports.css';
import { useTranslation } from 'react-i18next';

const MyReports: React.FC = () => {
    const { t } = useTranslation();
    const [reports, setReports] = useState<PetReport[]>([]);
    const [isReportsLoading, setIsReportsLoading] = useState<boolean>(true);
    const { user, isLoading: isAuthLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthLoading) return;

        if (!user) {
            navigate('/');
            return;
        }
        
        const fetchMyReports = async () => {
            try {
                const response = await reportService.getReports({ userId: user.id });
                setReports(response.reports);
            } catch (err) {
                console.error("Error fetching my reports:", err);
            } finally {
                setIsReportsLoading(false);
            }
        };
        fetchMyReports();
    }, [user, isAuthLoading, navigate]);

    if (isAuthLoading) return <div className="loading-state">{t('common.loading')}</div>;
    if (!user) return null;

    return (
        <div className="my-reports-page">
            <header className="my-reports-header">
                <h1>{t('my_reports_page.title')}</h1>
                <p>{t('my_reports_page.subtitle')}</p>
            </header>

            {isReportsLoading ? (
                <div className="loading-state">{t('common.loading')}</div>
            ) : (
                <div className="my-reports-grid">
                    {reports.length > 0 ? (
                        reports.map((report) => (
                            <PetCard key={report.id} pet={report} />
                        ))
                    ) : (
                        <div className="no-reports">
                            <p>{t('my_reports_page.empty_text')}</p>
                            <button className="btn-secondary" onClick={() => navigate('/report')}>{t('my_reports_page.cta_btn')}</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyReports;
