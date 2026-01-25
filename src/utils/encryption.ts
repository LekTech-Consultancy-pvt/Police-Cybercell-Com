import CryptoJS from 'crypto-js';

// In a real production app, this key should be in an environment variable
// and never committed to source control. For this demo, we'll use a hardcoded key.
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'lektech-cybercell-secure-key-2024';

export const encryptData = (data: any): string => {
    try {
        const jsonString = JSON.stringify(data);
        return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    } catch (error) {
        console.error('Encryption failed:', error);
        return '';
    }
};

export const decryptData = (ciphertext: string): any => {
    try {
        if (!ciphertext) return null;
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedString);
    } catch (error) {
        console.error('Decryption failed:', error);
        // Return original text if decryption fails (fallback for unencrypted legacy data)
        return ciphertext;
    }
};
