import AsyncStorage from '@react-native-async-storage/async-storage';

const RECORDS_KEY = 'veritas_evidence_records';

export const saveRecord = async (record) => {
    try {
        const existingRecords = await loadRecords();
        const filteredRecords = existingRecords.filter(r => r.id !== record.id);
        const updatedRecords = [...filteredRecords, record];
        await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
        console.log('Record saved locally:', record.id);
        return true;
    } catch (error) {
        console.error('Error saving record:', error);
        return false;
    }
};

export const loadRecords = async () => {
    try {
        const recordsJson = await AsyncStorage.getItem(RECORDS_KEY);
        const records = recordsJson ? JSON.parse(recordsJson) : [];
        console.log('Loaded records from storage:', records.length);
        return records;
    } catch (error) {
        console.error('Error loading records:', error);
        return [];
    }
};

export const deleteRecord = async (recordId) => {
    try {
        const existingRecords = await loadRecords();
        const updatedRecords = existingRecords.filter(r => r.id !== recordId);
        await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
        console.log('Record deleted locally:', recordId);
        return true;
    } catch (error) {
        console.error('Error deleting record:', error);
        return false;
    }
};

export const clearAllRecords = async () => {
    try {
        await AsyncStorage.removeItem(RECORDS_KEY);
        console.log('All records cleared from storage');
        return true;
    } catch (error) {
        console.error('Error clearing records:', error);
        return false;
    }
};