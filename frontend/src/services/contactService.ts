import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export interface ContactData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export const sendContactMessage = async (data: ContactData) => {
    try {
        const response = await axios.post(`${API_URL}/contact`, data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data?.message || 'Failed to send message';
    }
};
