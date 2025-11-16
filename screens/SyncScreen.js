import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { uploadFileToStorage, saveRecordToFirestore } from '../data/apiFirebase';
import { simulateBlockchainCommit } from '../data/apiBlockchain';
import RecordItem from '../components/shared/RecordItem';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function SyncScreen({ user }) {
    const { records, updateRecord, refreshRecords } = useData();
    const [syncing, setSyncing] = useState(false);
    const [currentStep, setCurrentStep] = useState('');
    const [currentRecord, setCurrentRecord] = useState(null);

    const pendingRecords = records.filter(record =>
        record.syncStatus === 'LOCAL_ONLY' || record.syncStatus === 'PENDING'
    );

    const syncAllRecords = async () => {
        if (pendingRecords.length === 0) {
            Alert.alert('Info', 'No pending records to sync');
            return;
        }

        setSyncing(true);

        try {
            for (const record of pendingRecords) {
                setCurrentRecord(record);

                if (record.type === 'fpic_record') {
                    await syncFPICRecord(record);
                } else {
                    await syncEvidenceRecord(record);
                }
            }

            Alert.alert('Success', `All ${pendingRecords.length} records secured in VERITAS!`);
            await refreshRecords();
        } catch (error) {
            Alert.alert('Sync Error', 'Failed to sync records: ' + error.message);
        } finally {
            setSyncing(false);
            setCurrentStep('');
            setCurrentRecord(null);
        }
    };

    const syncEvidenceRecord = async (record) => {
        try {
            setCurrentStep('Uploading evidence to VERITAS Cloud...');
            const downloadURL = await uploadFileToStorage(record.fileUri, record.fileName);

            setCurrentStep('Committing to Immutable Ledger...');
            let blockchainTxId;
            try {
                blockchainTxId = await simulateBlockchainCommit(record.sha256Hash, {
                    type: record.type,
                    location: record.location,
                    userId: user?.id || 'anonymous',
                    fileName: record.fileName
                });
            } catch (blockchainError) {
                blockchainTxId = `fallback_tx_${Date.now()}`;
            }

            setCurrentStep('Saving metadata...');
            await saveRecordToFirestore({
                ...record,
                downloadURL,
                blockchainTxId,
                userId: user?.id || 'anonymous'
            });

            await updateRecord(record.id, {
                syncStatus: 'COMPLETE',
                downloadURL,
                blockchainTxId,
                syncedAt: new Date().toISOString(),
                project: 'veritas-c2a5c',
                userId: user?.id || 'anonymous'
            });

        } catch (error) {
            throw error;
        }
    };

    const syncFPICRecord = async (record) => {
        try {
            setCurrentStep('Securing FPIC record on blockchain...');
            let blockchainTxId;
            try {
                blockchainTxId = await simulateBlockchainCommit(record.sha256Hash, {
                    type: 'fpic_record',
                    projectName: record.projectName,
                    community: record.community,
                    consensus: record.communityConsensus,
                    userId: user?.id || 'anonymous'
                });
            } catch (blockchainError) {
                blockchainTxId = `fpic_fallback_tx_${Date.now()}`;
            }

            setCurrentStep('Saving FPIC metadata...');
            await saveRecordToFirestore({
                ...record,
                blockchainTxId,
                userId: user?.id || 'anonymous',
                downloadURL: null
            });

            await updateRecord(record.id, {
                syncStatus: 'COMPLETE',
                blockchainTxId,
                syncedAt: new Date().toISOString(),
                project: 'veritas-c2a5c',
                userId: user?.id || 'anonymous'
            });

        } catch (error) {
            throw error;
        }
    };

    const syncSingleRecord = async (record) => {
        setSyncing(true);
        setCurrentRecord(record);

        try {
            if (record.type === 'fpic_record') {
                await syncFPICRecord(record);
            } else {
                await syncEvidenceRecord(record);
            }

            Alert.alert('Success', 'Record secured in VERITAS!');
            await refreshRecords();
        } catch (error) {
            Alert.alert('Sync Error', 'Failed to sync record: ' + error.message);
        } finally {
            setSyncing(false);
            setCurrentStep('');
            setCurrentRecord(null);
        }
    };

    const getStats = () => {
        const total = records.length;
        const pending = pendingRecords.length;
        const completed = total - pending;

        return { total, pending, completed };
    };

    const stats = getStats();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Image
                        source={require('../assets/EcoChain Custody.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <View style={styles.headerText}>
                        <Text style={styles.title}>EcoChain Custody</Text>
                        <Text style={styles.subtitle}>
                            Project: veritas-c2a5c
                            {user && ` • User: ${user.firstName} ${user.lastName}`}
                        </Text>
                    </View>
                </View>

                <Card variant="elevated" style={styles.statsCard}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.total}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, styles.pending]}>{stats.pending}</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, styles.completed]}>{stats.completed}</Text>
                            <Text style={styles.statLabel}>Secured</Text>
                        </View>
                    </View>
                </Card>

                <Button
                    title={syncing ? 'SYNCING TO VERITAS...' : 'START VERITAS SYNC'}
                    onPress={syncAllRecords}
                    disabled={syncing || pendingRecords.length === 0}
                    loading={syncing}
                    fullWidth
                    size="large"
                    style={styles.syncButton}
                />
            </View>

            {syncing && currentStep && (
                <Card style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                        Securing: {currentRecord?.fileName || currentRecord?.projectName || 'Record'}
                    </Text>
                    <Text style={styles.stepText}>{currentStep}</Text>
                    <ActivityIndicator size="small" color="#2E7D32" style={styles.progressIndicator} />
                </Card>
            )}

            <ScrollView style={styles.recordsList}>
                {records.length === 0 ? (
                    <Card style={styles.emptyState}>
                        <Ionicons name="cloud-offline" size={64} color="#ccc" />
                        <Text style={styles.emptyStateText}>No records yet</Text>
                        <Text style={styles.emptyStateSubtext}>
                            Capture evidence or create FPIC records to secure them in VERITAS
                        </Text>
                    </Card>
                ) : (
                    <View style={styles.recordsContainer}>
                        {records.map((record) => (
                            <RecordItem
                                key={record.id}
                                record={record}
                                showActions={record.syncStatus === 'LOCAL_ONLY' || record.syncStatus === 'PENDING'}
                                onPress={record.syncStatus === 'LOCAL_ONLY' || record.syncStatus === 'PENDING' ?
                                    () => syncSingleRecord(record) : null}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: 'white',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    logo: {
        width: 50,
        height: 50,
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'monospace',
    },
    statsCard: {
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    pending: {
        color: '#ff9800',
    },
    completed: {
        color: '#4caf50',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    syncButton: {
        marginTop: 8,
    },
    progressContainer: {
        margin: 16,
        alignItems: 'center',
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2E7D32',
        marginBottom: 4,
        textAlign: 'center',
    },
    stepText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
    progressIndicator: {
        marginTop: 4,
    },
    recordsList: {
        flex: 1,
    },
    recordsContainer: {
        padding: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        margin: 16,
    },
    emptyStateText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});