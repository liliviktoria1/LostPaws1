import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PetReport } from '../../types';

interface PetCardProps {
    pet: PetReport;
}

const PetCard: React.FC<PetCardProps> = ({ pet }) => {
    const navigate = useNavigate();

    const getImageUrl = (pet: PetReport): string => {
        if (pet.photos && pet.photos.length > 0) {
            const photo = pet.photos[0];
            const url = typeof photo === 'string' ? photo : (photo as any).url;
            
            if (!url) return '/assets/image/Dog.png';
            if (url.startsWith('/assets')) return url;
            if (url.startsWith('http')) return url;
            return `http://localhost:8080${url}`;
        }
        return '/assets/image/Dog.png'; 
    };

    return (
        <div className="slider-item" onClick={() => navigate(`/pet/${pet.id}`)}>
            <img src={getImageUrl(pet)} alt={pet.petName}/>
            <p>
                Name : <span className="pet-value">{pet.petName}</span><br/>
                Status : <span className={`status-label ${pet.petStatus}`}>{pet.petStatus === 'lost' ? 'Lost' : 'Found'}</span><br/>
                Addresses : <span className="pet-value">{pet.locationAddress}</span>
            </p>
            <button className="view-post-btn" onClick={(e) => { e.stopPropagation(); navigate(`/pet/${pet.id}`); }}>View Post</button>
        </div>
    );
};

export default PetCard;
