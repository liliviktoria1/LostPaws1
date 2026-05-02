import { PetReport, PetFilters, CreateReportResponse } from '../types';
import { authService } from './authService';
import i18n from '../i18n/i18n';

const BASE_API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

const getHeaders = (token?: string | null) => {
    const headers: any = {
        'x-lang': i18n.language.substring(0, 2)
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const reportService = {
    // Get all reports with optional filters
    getReports: async (filters: PetFilters & { page?: number; limit?: number } = {}): Promise<{ reports: PetReport[], total: number, totalPages: number, currentPage: number }> => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        const response = await fetch(`${BASE_API_URL}/reports?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch reports');
        return response.json();
    },

    // Get a single report by ID
    getReportById: async (id: string): Promise<PetReport> => {
        const response = await fetch(`${BASE_API_URL}/reports/${id}`);
        if (!response.ok) throw new Error('Failed to fetch report');
        return response.json();
    },

    // Mark a report as reunited
    markAsReunited: async (id: string): Promise<void> => {
        const token = authService.getToken();
        const response = await fetch(`${BASE_API_URL}/reports/${id}/reunited`, {
            method: 'PATCH',
            headers: getHeaders(token)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to mark as reunited');
        }
    },

    // Update an existing report
    updateReport: async (id: string, formData: FormData): Promise<PetReport> => {
        const token = authService.getToken();
        const response = await fetch(`${BASE_API_URL}/reports/${id}`, {
            method: 'PATCH',
            headers: getHeaders(token),
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Update failed');
        }

        return response.json();
    },

    // Create a new report (handles multipart/form-data for photos)
    createReport: async (formData: FormData): Promise<CreateReportResponse> => {
        const token = authService.getToken();
        const response = await fetch(`${BASE_API_URL}/reports`, {
            method: 'POST',
            headers: getHeaders(token),
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create report');
        }

        return response.json();
    },

    // Trigger visual deep scan manually
    triggerDeepScan: async (id: string): Promise<any> => {
        const token = authService.getToken();
        const response = await fetch(`${BASE_API_URL}/reports/${id}/deep-scan`, {
            headers: getHeaders(token),
        });
        if (!response.ok) throw new Error('AI Scan failed');
        return response.json();
    },

    // For debugging/preview during form creation
    analyzePhoto: async (file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('photo', file);

        const response = await fetch(`${BASE_API_URL}/reports/analyze`, {
            method: 'POST',
            headers: getHeaders(),
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();    
            throw new Error(errorData.message || 'AI Analysis failed');
        }

        return response.json();
    }
};
