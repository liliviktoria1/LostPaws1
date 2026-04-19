import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/reportService';
import { PetReport } from '../types';
import PetCard from './Common/PetCard';
import { useAuth } from '../context/AuthContext';
import './MyReports.css';

const MyReports: React.FC = () => {
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
                console.log(`[MyReports] Fetching for userId: ${user.id}`);
                const data = await reportService.getReports({ userId: user.id });
                console.log(`[MyReports] Found ${data.length} reports.`);
                setReports(data);
            } catch (err) {
                console.error("Error fetching my reports:", err);
            } finally {
                setIsReportsLoading(false);
            }
        };
        fetchMyReports();
    }, [user, isAuthLoading, navigate]);

    if (isAuthLoading) return <div className="loading-state">Initializing session...</div>;
    if (!user) return null;

    return (
        <div className="my-reports-page">
            <header className="my-reports-header">
                <h1>My Pet Reports</h1>
                <p>Manage your reported lost and found pets here.</p>
            </header>

            {isReportsLoading ? (
                <div className="loading-state">Loading your reports...</div>
            ) : (
                <div className="my-reports-grid">
                    {reports.length > 0 ? (
                        reports.map((report) => (
                            <div key={report.id} className="my-report-card-wrapper">
                                <PetCard pet={report} />
                            </div>
                        ))
                    ) : (
                        <div className="no-reports">
                            <p>You haven't submitted any reports yet.</p>
                            <button className="btn-secondary" onClick={() => navigate('/report')}>Create a Pet Alert</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyReports;
