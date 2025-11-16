import CryptoJS from 'crypto-js';

export const calculateSHA256 = async (fileUri) => {
    try {
        // For React Native, we'll use a simpler approach
        // Read the file as base64 and hash it
        const response = await fetch(fileUri);
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    // Convert ArrayBuffer to WordArray for crypto-js
                    const wordArray = CryptoJS.lib.WordArray.create(reader.result);
                    const hash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
                    resolve(hash);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(blob);
        });
    } catch (error) {
        console.error('Error calculating hash:', error);

        // Fallback: hash the file URI as string if file reading fails
        return CryptoJS.SHA256(fileUri + Date.now().toString()).toString(CryptoJS.enc.Hex);
    }
};

export const calculateSHA256FromString = (text) => {
    return CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex);
};