const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

export interface ContactData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export const sendContactMessage = async (data: ContactData) => {
    try {
        const response = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to send message');
        }

        return result;
    } catch (error: any) {
        throw error.message || 'Failed to send message';
    }
};
