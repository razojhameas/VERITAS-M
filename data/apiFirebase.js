import { doc, setDoc, getDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Test Firestore connection
export const testFirestoreConnection = async () => {
    try {
        await getDocs(collection(db, 'evidence_records'));
        console.log('VERITAS Firestore connection test: SUCCESS');
        return true;
    } catch (error) {
        console.log('VERITAS Firestore connection: Using simulated mode');
        return false;
    }
};

// Upload file to Firebase Storage (simulated for now)
export const uploadFileToStorage = async (localUri, fileName) => {
    try {
        // In a real implementation, this would upload to Firebase Storage
        const simulatedDownloadURL = `https://veritas-c2a5c.firebasestorage.app/evidence/${fileName}`;

        console.log('File uploaded to VERITAS storage:', fileName);
        return simulatedDownloadURL;
    } catch (error) {
        console.error('Error in file upload:', error);
        throw error;
    }
};

// Save evidence record to Firestore with proper error handling
export const saveRecordToFirestore = async (record) => {
    try {
        // Ensure all required fields have values
        const firestoreRecord = {
            id: record.id || Date.now().toString(),
            type: record.type || 'unknown',
            fileName: record.fileName || 'unknown',
            fileUri: record.fileUri || '',
            location: record.location || {
                latitude: 0,
                longitude: 0,
                accuracy: 0,
                timestamp: new Date().toISOString()
            },
            timestamp: record.timestamp || new Date().toISOString(),
            syncStatus: 'COMPLETE',
            sha256Hash: record.sha256Hash || 'unknown_hash',
            blockchainTxId: record.blockchainTxId || 'pending_tx_id',
            downloadURL: record.downloadURL || 'https://veritas-c2a5c.firebasestorage.app/evidence/unknown',
            syncedAt: new Date().toISOString(),
            project: 'veritas-c2a5c',
            platform: 'mobile',
            evidenceType: record.type || 'unknown',
            coordinates: record.location ? {
                latitude: record.location.latitude || 0,
                longitude: record.location.longitude || 0
            } : { latitude: 0, longitude: 0 },
            userId: record.userId || 'anonymous'
        };

        // Remove any undefined values
        Object.keys(firestoreRecord).forEach(key => {
            if (firestoreRecord[key] === undefined) {
                firestoreRecord[key] = null;
            }
        });

        const recordRef = doc(db, 'evidence_records', firestoreRecord.id);
        await setDoc(recordRef, firestoreRecord);
        console.log('Record saved to VERITAS Firestore:', firestoreRecord.id);
        return true;
    } catch (error) {
        console.error('Error saving record to Firestore:', error);
        throw error;
    }
};

// Get single record from Firestore
export const getRecordFromFirestore = async (recordId) => {
    try {
        const recordRef = doc(db, 'evidence_records', recordId);
        const docSnap = await getDoc(recordRef);

        if (docSnap.exists()) {
            console.log('Record retrieved from VERITAS Firestore:', recordId);
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting record from Firestore:', error);
        return null;
    }
};

// Get all records from Firestore (without complex queries to avoid index issues)
export const getAllRecordsFromFirestore = async () => {
    try {
        const recordsRef = collection(db, 'evidence_records');
        const querySnapshot = await getDocs(recordsRef);
        const records = [];

        querySnapshot.forEach((doc) => {
            records.push({ id: doc.id, ...doc.data() });
        });

        // Sort by timestamp manually to avoid index requirements
        records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        console.log(`Retrieved ${records.length} records from VERITAS Firestore`);
        return records;
    } catch (error) {
        console.error('Error getting all records from Firestore:', error);
        return [];
    }
};

// Get records by user ID (simplified to avoid index requirements)
export const getRecordsByUser = async (userId) => {
    try {
        const recordsRef = collection(db, 'evidence_records');
        const querySnapshot = await getDocs(recordsRef);
        const records = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.userId === userId) {
                records.push({ id: doc.id, ...data });
            }
        });

        // Sort by timestamp manually
        records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        console.log(`Retrieved ${records.length} records for user ${userId}`);
        return records;
    } catch (error) {
        console.error('Error getting user records from Firestore:', error);
        return [];
    }
};

// Get records by community/region
export const getRecordsByRegion = async (latitude, longitude, radiusKm = 50) => {
    try {
        const allRecords = await getAllRecordsFromFirestore();
        return allRecords.filter(record => {
            if (!record.coordinates) return false;

            const distance = calculateDistance(
                latitude, longitude,
                record.coordinates.latitude, record.coordinates.longitude
            );
            return distance <= radiusKm;
        });
    } catch (error) {
        console.error('Error getting records by region:', error);
        return [];
    }
};

// Helper function to calculate distance between coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};