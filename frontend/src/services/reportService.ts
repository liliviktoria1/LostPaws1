import { PetReport, PetFilters, CreateReportResponse } from '../types';
import { authService } from './authService';

const BASE_API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

export const reportService = {
    // Fetch all reports with optional filters
    getReports: async (filters: PetFilters = {}): Promise<PetReport[]> => {
        const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
        const response = await fetch(`${BASE_API_URL}/reports?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch reports');
        return response.json();
    },

    // Get a single report by ID
    getReportById: async (id: string): Promise<PetReport> => {
        const response = await fetch(`${BASE_API_URL}/reports/${id}`);
        if (!response.ok) throw new Error('Failed to fetch report');
        return response.json();
    },

    // Create a new report (handles multipart/form-data for photos)
    createReport: async (reportData: Partial<PetReport> & { photos?: File[] }): Promise<CreateReportResponse> => {
        const formData = new FormData();
        const token = authService.getToken();

        // Append all text fields
        Object.keys(reportData).forEach(key => {        
            const value = (reportData as any)[key];
            if (key === 'photos' && Array.isArray(value)) {
                value.forEach((file: File) => {     
                    formData.append('photos', file);    
                });
            } else if (key === 'location' && typeof value === 'object') {
                formData.append(key, JSON.stringify(value));
            } else if (value !== undefined && value !== null && value !== '') {
                formData.append(key, value as string);  
            }
        });

        const response = await fetch(`${BASE_API_URL}/reports`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formData, // Browser automatically sets Content-Type to multipart/form-data
        });

        if (!response.ok) {
            const errorData = await response.json();    
            throw new Error(errorData.message || 'Failed to create report');
        }

        return response.json();
    },

    // Delete a report
    deleteReport: async (id: string): Promise<void> => {
        const token = authService.getToken();
        const response = await fetch(`${BASE_API_URL}/reports/${id}`, {
            method: 'DELETE',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (!response.ok) throw new Error('Failed to delete report');
        return response.json();
    },

    // Analyze pet photo with AI
    analyzePetImage: async (photoFile: File): Promise<any> => {
        const formData = new FormData();
        formData.append('photo', photoFile);

        const response = await fetch(`${BASE_API_URL}/reports/analyze`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();    
            throw new Error(errorData.message || 'AI Analysis failed');
        }

        return response.json();
    }
};

