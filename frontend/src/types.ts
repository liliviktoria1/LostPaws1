export type PetStatus = 'lost' | 'found';
export type PetSpecies = 'cat' | 'dog' | 'other';
export type PetSex = 'female' | 'male' | 'unknown';

export interface PetReport {
    id: string;
    petStatus: PetStatus;
    petName: string;
    petSpecies: PetSpecies;
    petSex?: PetSex;
    description?: string;
    locationAddress?: string;
    locationLat?: number;
    locationLng?: number;
    dateLastSeen?: string | Date;
    contactName?: string;
    contactNumber?: string;
    contactEmail: string;
    photos?: string[];
    embedding?: number[];
    createdAt?: string;
    updatedAt?: string;
}

export interface PetFilters {
    petStatus?: PetStatus;
    petSpecies?: PetSpecies;
    petSex?: PetSex;
}

export interface Announcement {
    id: number;
    name: string;
    status: string;
    location: string;
    petType: string;
    sex: string;
    date: string;
    image: string;
}

export interface MockPet {
    id: number;
    name: string;
    status: string;
    location: string;
    image: string;
}
