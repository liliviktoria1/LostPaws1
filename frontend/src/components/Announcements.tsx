import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { PetReport, PetStatus, Announcement } from '../types';
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

    const getImageUrl = (report: PetReport): string => {
        if (report.photos && report.photos.length > 0) {
            const photo = report.photos[0];
            const url = typeof photo === 'string' ? photo : (photo as any).url;

            if (!url) return '/assets/image/Dog.png';
            if (url.startsWith('/assets')) return url;
            if (url.startsWith('http')) return url;
            return `http://localhost:5000${url}`;
        }
        return '/assets/image/Dog.png';
    };

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
                            <div key={report.id} className={`announcement-card ${report.petStatus}`}>
                                <div className="card-image">
                                    <img src={getImageUrl(report)} alt={report.petName} />
                                    <span className={`status-badge ${report.petStatus}`}>
                                        {report.petStatus}
                                    </span>
                                </div>
                                <div className="card-content">
                                    <h3>{report.petName}</h3>
                                    <p className="species">{report.petSpecies} ({report.petSex})</p>
                                    <p className="description">{report.description}</p>
                                    <div className="card-footer">
                                        <p className="location">📍 {report.locationAddress}</p>
                                        <p className="date">📅 {report.dateLastSeen ? new Date(report.dateLastSeen).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div className="contact-info">
                                        <p>Contact: <strong>{report.contactName || 'Anonymous'}</strong></p>
                                        <button className="contact-btn">View Contact</button>
                                    </div>
                                </div>
                            </div>
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
