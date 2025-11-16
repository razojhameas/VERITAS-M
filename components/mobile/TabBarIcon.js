import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabBarIcon({ name, focused, color, size = 28 }) {
    return (
        <View style={[
            styles.container,
            focused && styles.containerFocused
        ]}>
            <Ionicons
                name={name}
                size={size}
                color={color}
            />
            {focused && <View style={styles.dot} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    containerFocused: {
        // Add any focused state styling here
    },
    dot: {
        position: 'absolute',
        bottom: 2,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#2E7D32', // Green dot for active tab
    },
});