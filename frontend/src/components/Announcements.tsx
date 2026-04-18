import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { PetReport, PetStatus, Announcement } from '../types';
import PetCard from './Common/PetCard';
import './Announcements.css';

interface AnnouncementsProps {
    announcements?: Announcement[];
}

const Announcements: React.FC<AnnouncementsProps> = ({ announcements }) => {
    const [reports, setReports] = useState<PetReport[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<PetStatus | 'all'>('all');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const query = filter === 'all' ? {} : { petStatus: filter };
                const data = await reportService.getReports(query);
                setReports(data);
            } catch (err) {
                console.error("Error fetching announcements:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReports();
    }, [filter]);

    return (
        <div className="announcements-page">
            <header className="announcements-header">
                <h1>Pet Announcements</h1>
                <div className="filter-buttons">
                    <button 
                        className={filter === 'all' ? 'active' : ''} 
                        onClick={() => setFilter('all')}
                    >All</button>
                    <button 
                        className={filter === 'lost' ? 'active' : ''} 
                        onClick={() => setFilter('lost')}
                    >Lost</button>
                    <button 
                        className={filter === 'found' ? 'active' : ''} 
                        onClick={() => setFilter('found')}
                    >Found</button>
                </div>
            </header>

            {isLoading ? (
                <div className="loading-state">Loading announcements...</div>
            ) : (
                <div className="announcements-grid">
                    {reports.length > 0 ? (
                        reports.map((report) => (
                            <PetCard key={report.id} pet={report} />
                        ))
                    ) : (
                        <p className="no-reports">No announcements found for this category.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Announcements;
