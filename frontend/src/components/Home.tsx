import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { PetReport } from '../types';
import PetSlider from './Common/PetSlider';
import Hero from './Home/Sections/Hero';
import Mission from './Home/Sections/Mission';
import HowItWorks from './Home/Sections/HowItWorks';
import CTA from './Home/Sections/CTA';
import './Home.css';

const Home: React.FC = () => {
    const [missingPets, setMissingPets] = useState<PetReport[]>([]);
    const [foundPets, setFoundPets] = useState<PetReport[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const [lostData, foundData] = await Promise.all([
                    reportService.getReports({ petStatus: 'lost' }),
                    reportService.getReports({ petStatus: 'found' })
                ]);
                setMissingPets(lostData.slice(0, 10));
                setFoundPets(foundData.slice(0, 10));
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
                title="Missing Pets"
                subtitle="Help get these paws home"
                pets={missingPets}
                isLoading={isLoading}
                emptyMessage="No missing pets found."
                sectionClass="missing-pets"
            />

            <PetSlider 
                title="Found Pets"
                subtitle="Read about recently reunited pets."
                pets={foundPets}
                isLoading={isLoading}
                emptyMessage="No found pets reported."
                sectionClass="found-pets"
            />

            <CTA />
        </div>
    );
};

export default Home;
