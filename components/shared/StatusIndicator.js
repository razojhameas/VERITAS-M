import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StatusIndicator({ status, size = 'medium' }) {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'PENDING':
                return {
                    color: '#ff9800',
                    text: 'Pending',
                    icon: 'time'
                };
            case 'COMPLETE':
                return {
                    color: '#4caf50',
                    text: 'Complete',
                    icon: 'checkmark-circle'
                };
            case 'ERROR':
                return {
                    color: '#f44336',
                    text: 'Error',
                    icon: 'close-circle'
                };
            case 'SYNCING':
                return {
                    color: '#2196f3',
                    text: 'Syncing',
                    icon: 'sync'
                };
            default:
                return {
                    color: '#666',
                    text: 'Unknown',
                    icon: 'help-circle'
                };
        }
    };

    const getSizeConfig = (size) => {
        switch (size) {
            case 'small':
                return { iconSize: 12, textSize: 10 };
            case 'medium':
                return { iconSize: 16, textSize: 12 };
            case 'large':
                return { iconSize: 20, textSize: 14 };
            default:
                return { iconSize: 16, textSize: 12 };
        }
    };

    const config = getStatusConfig(status);
    const sizeConfig = getSizeConfig(size);

    return (
        <View style={styles.container}>
            <Ionicons
                name={config.icon}
                size={sizeConfig.iconSize}
                color={config.color}
            />
            <Text style={[
                styles.text,
                {
                    color: config.color,
                    fontSize: sizeConfig.textSize,
                    marginLeft: size === 'small' ? 4 : 6
                }
            ]}>
                {config.text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        fontWeight: '500',
    },
});