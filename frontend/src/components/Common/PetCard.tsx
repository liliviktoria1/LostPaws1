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
            const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '');
            return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
        }
        return '/assets/image/Dog.png'; 
    };
    return (
        <div className="slider-item" onClick={() => navigate(`/pet/${pet.id}`)}>
            <div style={{ position: 'relative', width: '100%' }}>
                <img src={getImageUrl(pet)} alt={pet.petName}/>
                {pet.photos && pet.photos.length > 1 && (
                    <div className="photo-count-badge">
                        1/{pet.photos.length} 📷
                    </div>
                )}
            </div>
            <div className="pet-info-container">
                <p>
                    <span className="pet-label">Name:</span> <span className="pet-value">{pet.petName}</span><br/>
                    <span className="pet-label">Status:</span> <span className={`status-label ${pet.petStatus}`}>{pet.petStatus === 'lost' ? 'Lost' : 'Found'}</span><br/>
                    <span className="pet-label">Addresses:</span> <span className="pet-value">{pet.locationAddress}</span>
                    <button className="view-post-btn" onClick={(e) => { e.stopPropagation(); navigate(`/pet/${pet.id}`); }}>View Post</button>
                </p>
            </div>
        </div>
    );
};

export default PetCard;
