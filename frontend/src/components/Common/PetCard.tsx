import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PetReport } from '../../types';
import { useTranslation } from 'react-i18next';
import './PetCard.css';

interface PetCardProps {
    pet: PetReport;
}

const PetCard: React.FC<PetCardProps> = ({ pet }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

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
        <div className={`slider-item ${pet.isReunited ? 'reunited-card' : ''}`} onClick={() => navigate(`/pet/${pet.id}`)}>
            <div style={{ position: 'relative', width: '100%' }}>
                {pet.isReunited && <div className="reunited-badge">{t('common.reunited_tag')}</div>}
                <img src={getImageUrl(pet)} alt={pet.petName}/>
                {pet.photos && pet.photos.length > 1 && (
                    <div className="photo-count-badge">
                        1/{pet.photos.length} 📷
                    </div>
                )}
            </div>
            <div className="pet-info-container">
                <div className="info-row">
                    <span className="pet-label">{t('form.pet_name')}:</span> <span className="pet-value">{pet.petName}</span>
                </div>
                <div className="info-row">
                    <span className="pet-label">{t('form.status')}:</span> <span className={`status-label ${pet.petStatus}`}>{t(`common.${pet.petStatus}`)}</span>
                </div>
                <div className="info-row">
                    <span className="pet-label">{t('form.color')}:</span> <span className="pet-value color-row">
                        {pet.petColor || t('common.unknown')}
                        {pet.petColor && pet.petColor.startsWith('#') && (
                            <span style={{ 
                                display: 'inline-block', 
                                width: '12px', 
                                height: '12px', 
                                borderRadius: '50%', 
                                backgroundColor: pet.petColor,
                                border: '1px solid #ddd'
                            }}></span>
                        )}
                    </span>
                </div>
                <div className="info-row location-row">
                    <span className="pet-label">{t('form.location')}:</span> <span className="pet-value truncate">{pet.locationAddress}</span>
                </div>
                <button className="view-post-btn" onClick={(e) => { e.stopPropagation(); navigate(`/pet/${pet.id}`); }}>{t('maps.view_details')}</button>
            </div>
        </div>
    );
};

export default PetCard;
