import React, { useRef } from 'react';
import { PetReport } from '../../types';
import PetCard from './PetCard';
import './PetSlider.css';

interface PetSliderProps {
    title: string;
    subtitle: string;
    pets: PetReport[];
    isLoading: boolean;
    emptyMessage: string;
    sectionClass: string;
}

const PetSlider: React.FC<PetSliderProps> = ({ 
    title, 
    subtitle, 
    pets, 
    isLoading, 
    emptyMessage,
    sectionClass 
}) => {
    const sliderRef = useRef<HTMLDivElement>(null);

    const scrollSlider = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className={`pet-slider-section ${sectionClass} full-width-section`}>
            <h2>{title}</h2>
            <p>{subtitle}</p>
            <div className="slider-container-wrapper">
                <button 
                    className="slider-button left"
                    onClick={() => scrollSlider('left')}
                >
                    <svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>
                </button>

                <div className="slider-items-container" ref={sliderRef}>
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : pets.length > 0 ? (
                        pets.map(pet => <PetCard key={pet.id} pet={pet} />)
                    ) : (
                        <p>{emptyMessage}</p>
                    )}
                </div>

                <button 
                    className="slider-button right"
                    onClick={() => scrollSlider('right')}
                >
                    <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
                </button>
            </div>
        </section>
    );
};

export default PetSlider;
