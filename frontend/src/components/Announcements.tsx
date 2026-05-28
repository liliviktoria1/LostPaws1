import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { PetReport, PetStatus, PetSpecies, PetFilters, PetSex, PetAge } from '../types';
import { FiFilter, FiX } from 'react-icons/fi';
import PetCard from './Common/PetCard';
import { useTranslation } from 'react-i18next';
import './Announcements.css';

const Announcements: React.FC = () => {
    const { t } = useTranslation();
    const [reports, setReports] = useState<PetReport[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showFilters, setShowFilters] = useState<boolean>(window.innerWidth > 1024);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalReports, setTotalReports] = useState<number>(0);
    const reportsPerPage = 6;
    
    // Filter State
    const [filters, setFilters] = useState({
        petStatus: '' as PetStatus | '',
        petSpecies: '' as PetSpecies | '',
        petSex: '' as PetSex | '',
        petAge: '' as PetAge | '',
        petBreed: '',
        petColor: '',
        city: ''
    });

    useEffect(() => {
        const fetchReports = async () => {
            setIsLoading(true);
            try {
                const activeFilters: any = {
                    page: currentPage,
                    limit: reportsPerPage
                };
                if (filters.petStatus) activeFilters.petStatus = filters.petStatus;
                if (filters.petSpecies) activeFilters.petSpecies = filters.petSpecies;
                if (filters.petSex) activeFilters.petSex = filters.petSex;
                if (filters.petAge) activeFilters.petAge = filters.petAge;
                if (filters.petBreed) activeFilters.petBreed = filters.petBreed;
                if (filters.petColor) activeFilters.petColor = filters.petColor;
                if (filters.city) activeFilters.city = filters.city;

                const response = await reportService.getReports(activeFilters);
                setReports(response.reports || []);
                setTotalPages(response.totalPages || 1);
                setTotalReports(response.total || 0);
            } catch (err) {
                console.error("Error fetching announcements:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReports();
    }, [filters, currentPage]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1); 
    };

    const clearFilters = () => {
        setFilters({ 
            petStatus: '', 
            petSpecies: '', 
            petSex: '', 
            petAge: '', 
            petBreed: '', 
            petColor: '', 
            city: '' 
        });
        setCurrentPage(1);
    };

    return (
        <div className="announcements-page">
            <div className="announcements-container-main">
                <aside className={`announcements-sidebar ${showFilters ? 'visible' : 'hidden'}`}>
                    <div className="sidebar-header">
                        <h2 className="sidebar-title">{t('announcements.filter_title')}</h2>
                        <button className="icon-close-btn" onClick={() => setShowFilters(false)}>
                            <FiX />
                        </button>
                    </div>
                    
                    <div className="filter-group">
                        <label>{t('form.status')}</label>
                        <select name="petStatus" value={filters.petStatus} onChange={handleFilterChange}>
                            <option value="">{t('maps.all_statuses')}</option>
                            <option value="lost">{t('common.lost')}</option>
                            <option value="found">{t('common.found')}</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>{t('form.species')}</label>
                        <select name="petSpecies" value={filters.petSpecies} onChange={handleFilterChange}>
                            <option value="">{t('maps.all_animals')}</option>
                            <option value="dog">{t('common.dog')}</option>
                            <option value="cat">{t('common.cat')}</option>
                            <option value="other">{t('common.other')}</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>{t('form.sex')}</label>
                        <select name="petSex" value={filters.petSex} onChange={handleFilterChange}>
                            <option value="">{t('announcements.any_sex')}</option>
                            <option value="male">{t('common.male')}</option>
                            <option value="female">{t('common.female')}</option>
                            <option value="unknown">{t('common.unknown')}</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>{t('form.age')}</label>
                        <select name="petAge" value={filters.petAge} onChange={handleFilterChange}>
                            <option value="">{t('announcements.any_age')}</option>
                            <option value="baby">{t('common.baby')}</option>
                            <option value="young">{t('common.young')}</option>
                            <option value="adult">{t('common.adult')}</option>
                            <option value="senior">{t('common.senior')}</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>{t('form.breed')}</label>
                        <input 
                            type="text" 
                            name="petBreed" 
                            placeholder={t('form.breed')} 
                            value={filters.petBreed} 
                            onChange={handleFilterChange}
                        />
                    </div>

                        <div className="filter-group">
                        <label>{t('form.color')}</label>
                        <div className="color-input-container">
                            <input 
                                type="text" 
                                name="petColor" 
                                placeholder={t('form.color')} 
                                value={filters.petColor} 
                                onChange={handleFilterChange}
                            />
                            <div className="color-picker-wrapper small">
                                <input 
                                    type="color" 
                                    value={filters.petColor && filters.petColor.startsWith('#') ? filters.petColor : '#FAC655'} 
                                    onChange={(e) => setFilters(prev => ({ ...prev, petColor: e.target.value }))}
                                    className="color-picker-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>{t('maps.city_label')}</label>
                        <input 
                            type="text" 
                            name="city" 
                            placeholder={t('maps.city_label')} 
                            value={filters.city} 
                            onChange={handleFilterChange}
                        />
                    </div>

                    <button className="clear-filters-btn" onClick={clearFilters}>
                        {t('maps.reset_filters')}
                    </button>

                    <div className="stats-box">
                        <p>{t('maps.found_reports', { count: totalReports })}</p>
                    </div>
                </aside>

                <main className="announcements-content">
                    <header className="content-header centered">
                        <div className="title-area">
                            <h1>{t('announcements.title')}</h1>
                            <p>{t('announcements.subtitle')}</p>
                        </div>
                        <div className="header-actions-row">
                            {!showFilters && (
                                <button className="filter-toggle-btn-modern" onClick={() => setShowFilters(true)}>
                                    <FiFilter /> <span>{t('announcements.filter_title')}</span>
                                </button>
                            )}
                        </div>
                    </header>

                    {isLoading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>{t('announcements.loading')}</p>
                        </div>
                    ) : (
                        <>
                            <div className="announcements-grid">
                                {reports.length > 0 ? (
                                    reports.map((report) => (
                                        <PetCard key={report.id} pet={report} />
                                    ))
                                ) : (
                                    <div className="no-reports-box">
                                        <p className="no-reports">{t('announcements.no_results')}</p>
                                        <button onClick={clearFilters}>{t('announcements.clear_filters')}</button>
                                    </div>
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button 
                                        disabled={currentPage === 1} 
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="pag-btn"
                                    >
                                        &larr; {t('announcements.previous')}
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button 
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`pag-number ${currentPage === i + 1 ? 'active' : ''}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button 
                                        disabled={currentPage === totalPages} 
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="pag-btn"
                                    >
                                        {t('announcements.next')} &rarr;
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Announcements;
