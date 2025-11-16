import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Card({ children, style, variant = 'default', padding = 'medium' }) {
    const getCardStyle = () => {
        const baseStyle = [styles.card];

        switch (variant) {
            case 'elevated':
                baseStyle.push(styles.cardElevated);
                break;
            case 'outlined':
                baseStyle.push(styles.cardOutlined);
                break;
            case 'flat':
                baseStyle.push(styles.cardFlat);
                break;
            default:
                baseStyle.push(styles.cardDefault);
        }

        switch (padding) {
            case 'small':
                baseStyle.push(styles.paddingSmall);
                break;
            case 'large':
                baseStyle.push(styles.paddingLarge);
                break;
            default:
                baseStyle.push(styles.paddingMedium);
        }

        if (style) baseStyle.push(style);

        return baseStyle;
    };

    return (
        <View style={getCardStyle()}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        marginVertical: 8,
    },
    cardDefault: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    cardElevated: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 0,
    },
    cardOutlined: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
    },
    cardFlat: {
        backgroundColor: 'white',
        borderWidth: 0,
        shadowColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
    },
    paddingSmall: {
        padding: 12,
    },
    paddingMedium: {
        padding: 16,
    },
    paddingLarge: {
        padding: 20,
    },
});