import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { PetReport } from '../types';
import PetSlider from './Common/PetSlider';
import Hero from './Home/Sections/Hero';
import Mission from './Home/Sections/Mission';
import HowItWorks from './Home/Sections/HowItWorks';
import CTA from './Home/Sections/CTA';
import './Home.css';
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
    const { t } = useTranslation();
    const [missingPets, setMissingPets] = useState<PetReport[]>([]);
    const [foundPets, setFoundPets] = useState<PetReport[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPets = async () => {
            setIsLoading(true);
            try {
                const [lostData, foundData] = await Promise.all([
                    reportService.getReports({ petStatus: 'lost' }),
                    reportService.getReports({ petStatus: 'found' })
                ]);
                setMissingPets(lostData.reports.slice(0, 10));
                setFoundPets(foundData.reports.slice(0, 10));
            } catch (err) {
                console.error('Error fetching pets:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPets();
    }, []);

    return (
        <div className="home">
            <Hero />
            <Mission />
            <HowItWorks />

            <PetSlider 
                title={t('home.missing_pets')}
                subtitle={t('home.missing_pets_sub')}
                pets={missingPets}
                isLoading={isLoading}
                emptyMessage={t('home.missing_pets_empty')}
                sectionClass="missing-pets"
            />

            <PetSlider 
                title={t('home.found_pets')}
                subtitle={t('home.found_pets_sub')}
                pets={foundPets}
                isLoading={isLoading}
                emptyMessage={t('home.found_pets_empty')}
                sectionClass="found-pets"
            />

            <CTA />
        </div>
    );
};

export default Home;
