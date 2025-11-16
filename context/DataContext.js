import React, { createContext, useState, useContext, useEffect } from 'react';
import { loadRecords, saveRecord, deleteRecord } from '../data/storage';
import { getAllRecordsFromFirestore, getRecordsByUser } from '../data/apiFirebase';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children, user = null }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncedRecords, setSyncedRecords] = useState([]);

    useEffect(() => {
        loadInitialData();
    }, [user]);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            // Load local records
            const storedRecords = await loadRecords();
            setRecords(storedRecords);

            // Load synced records from Firestore if user is logged in
            if (user) {
                const firestoreRecords = await getRecordsByUser(user.id);
                setSyncedRecords(firestoreRecords);
            } else {
                const allRecords = await getAllRecordsFromFirestore();
                setSyncedRecords(allRecords);
            }
        } catch (error) {
            console.error('Error loading records:', error);
        } finally {
            setLoading(false);
        }
    };

    const addRecord = async (record) => {
        const newRecord = {
            ...record,
            id: record.id || Date.now().toString(),
            createdAt: new Date().toISOString(),
            syncStatus: 'LOCAL_ONLY', // Updated to reflect offline-first approach
            userId: user?.id || 'anonymous'
        };

        const updatedRecords = [...records, newRecord];
        setRecords(updatedRecords);
        await saveRecord(newRecord);
        return newRecord;
    };

    const updateRecord = async (recordId, updates) => {
        const updatedRecords = records.map(record =>
            record.id === recordId ? { ...record, ...updates } : record
        );
        setRecords(updatedRecords);

        const recordToUpdate = updatedRecords.find(r => r.id === recordId);
        if (recordToUpdate) {
            await saveRecord(recordToUpdate);
        }
    };

    const deleteRecordById = async (recordId) => {
        const updatedRecords = records.filter(record => record.id !== recordId);
        setRecords(updatedRecords);
        await deleteRecord(recordId);
    };

    const refreshRecords = async () => {
        await loadInitialData();
    };

    const getPendingRecords = () => {
        return records.filter(record => record.syncStatus === 'LOCAL_ONLY' || record.syncStatus === 'PENDING');
    };

    const getCompletedRecords = () => {
        return records.filter(record => record.syncStatus === 'COMPLETE');
    };

    const getAllSyncedRecords = () => {
        return syncedRecords;
    };

    const getCommunityStats = () => {
        const communities = {};

        syncedRecords.forEach(record => {
            if (record.location) {
                const communityKey = `${record.location.latitude.toFixed(2)},${record.location.longitude.toFixed(2)}`;
                if (!communities[communityKey]) {
                    communities[communityKey] = {
                        location: record.location,
                        evidenceCount: 0,
                        lastUpdate: record.timestamp,
                        types: new Set()
                    };
                }
                communities[communityKey].evidenceCount++;
                communities[communityKey].types.add(record.type);
                if (new Date(record.timestamp) > new Date(communities[communityKey].lastUpdate)) {
                    communities[communityKey].lastUpdate = record.timestamp;
                }
            }
        });

        return Object.values(communities).map(community => ({
            ...community,
            types: Array.from(community.types)
        }));
    };

    const value = {
        records,
        syncedRecords,
        loading,
        addRecord,
        updateRecord,
        deleteRecord: deleteRecordById,
        refreshRecords,
        getPendingRecords,
        getCompletedRecords,
        getAllSyncedRecords,
        getCommunityStats
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};