import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusIndicator from './StatusIndicator';

export default function RecordItem({ record, onPress, showActions = false }) {
    const getFileIcon = (type) => {
        return type === 'photo' ? 'image' : 'videocam';
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatLocation = (location) => {
        if (!location) return 'No location';
        return `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`;
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.header}>
                <View style={styles.fileInfo}>
                    <Ionicons
                        name={getFileIcon(record.type)}
                        size={20}
                        color="#666"
                    />
                    <Text style={styles.fileName} numberOfLines={1}>
                        {record.fileName}
                    </Text>
                </View>
                <StatusIndicator status={record.syncStatus} size="small" />
            </View>

            <View style={styles.details}>
                <Text style={styles.timestamp}>
                    {formatDate(record.timestamp)}
                </Text>
                <Text style={styles.location}>
                    📍 {formatLocation(record.location)}
                </Text>

                {record.blockchainTxId && (
                    <Text style={styles.txId} numberOfLines={1}>
                        🔗 TX: {record.blockchainTxId.slice(0, 16)}...
                    </Text>
                )}

                {record.sha256Hash && (
                    <Text style={styles.hash} numberOfLines={1}>
                        🔒 Hash: {record.sha256Hash.slice(0, 16)}...
                    </Text>
                )}
            </View>

            {showActions && record.syncStatus === 'PENDING' && (
                <View style={styles.actions}>
                    <Text style={styles.syncHint}>
                        Tap Sync tab to secure this evidence
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 16,
        marginVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    details: {
        marginLeft: 28,
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    location: {
        fontSize: 11,
        color: '#888',
        marginBottom: 4,
    },
    txId: {
        fontSize: 10,
        color: '#2E7D32', // Updated to green
        fontFamily: 'monospace',
        marginBottom: 2,
    },
    hash: {
        fontSize: 10,
        color: '#4caf50',
        fontFamily: 'monospace',
        marginBottom: 2,
    },
    actions: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    syncHint: {
        fontSize: 11,
        color: '#ff9800',
        fontStyle: 'italic',
        textAlign: 'center',
    },
});