/**
 * Amane Asset Service
 * Handles secure data transfer to the independent L0 Gateway.
 */

const GATEWAY_URL = 'http://localhost:8000/v1/process-asset';

export const processAssetToGateway = async (imageFile, transcript) => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('transcript', transcript);

        const response = await fetch(GATEWAY_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Gateway responded with ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Gateway Sync Error:", error);
        throw error;
    }
};
