/**
 * Geocoding Service using OpenStreetMap (Nominatim)
 */

interface GeocodeResult {
    lat: number;
    lng: number;
}

export const geocodeAddress = async (address: string): Promise<GeocodeResult | null> => {
    try {
        if (!address) return null;

        const encodedAddress = encodeURIComponent(address);
        // Using Nominatim (OpenStreetMap) - Note: In production, consider a key-based provider like Google or Mapbox
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'LostPaws-App/1.0' // Requirement for Nominatim
            }
        });

        if (!response.ok) {
            console.error('Geocoding API error:', response.statusText);
            return null;
        }

        const data: any = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }

        return null;
    } catch (error) {
        console.error('Geocoding Service Error:', error);
        return null;
    }
};
