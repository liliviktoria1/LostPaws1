const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const reportService = {
    // Fetch all reports with optional filters
    getReports: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL}/reports?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch reports');
        return response.json();
    },

    // Get a single report by ID
    getReportById: async (id) => {
        const response = await fetch(`${API_URL}/reports/${id}`);
        if (!response.ok) throw new Error('Failed to fetch report');
        return response.json();
    },

    // Create a new report (handles multipart/form-data for photos)
    createReport: async (reportData) => {
        const formData = new FormData();

        // Append all text fields
        Object.keys(reportData).forEach(key => {
            if (key === 'photos') {
                reportData.photos.forEach(file => {
                    formData.append('photos', file);
                });
            } else if (key === 'location') {
                formData.append(key, JSON.stringify(reportData[key]));
            } else {
                formData.append(key, reportData[key]);
            }
        });

        const response = await fetch(`${API_URL}/reports`, {
            method: 'POST',
            body: formData, // Browser automatically sets Content-Type to multipart/form-data
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create report');
        }

        return response.json();
    },

    // Delete a report
    deleteReport: async (id) => {
        const response = await fetch(`${API_URL}/reports/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete report');
        return response.json();
    }
};
