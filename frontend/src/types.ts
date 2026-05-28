export type PetStatus = 'lost' | 'found';
export type PetSpecies = 'cat' | 'dog' | 'other';
export type PetSex = 'female' | 'male' | 'unknown';
export type PetAge = 'baby' | 'young' | 'adult' | 'senior';

export interface User {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    createdAt?: string;
}
export interface PetReport {
    id: string;
    petStatus: PetStatus;
    petName: string;
    petSpecies: PetSpecies;
    petBreed?: string;
    petColor?: string;
    petAge?: PetAge;
    petSex: PetSex;
    description: string;
    locationAddress: string;
    locationLat?: number;
    locationLng?: number;
    dateLastSeen: string;
    contactName: string;
    contactNumber: string;
    contactEmail: string;
    photos: { url: string }[];
    embedding?: number[];
    userId?: string;
    isReunited: boolean;
    createdAt?: string;
    user?: {
        name: string;
        email: string;
        phoneNumber?: string;
    };
}

export interface PetMatch {
    report: PetReport;
    score: number;
    reasoning?: string;
}

export interface CreateReportResponse {
    report: PetReport;
    potentialMatches: PetMatch[];
}

export interface PetFilters {
    petStatus?: PetStatus;
    petSpecies?: PetSpecies;
    petBreed?: string;
    petColor?: string;
    petAge?: PetAge;
    petSex?: PetSex;
    userId?: string;
    city?: string;
    isReunited?: boolean;
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
