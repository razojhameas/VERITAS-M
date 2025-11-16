import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function Button({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    size = 'medium',
    fullWidth = false,
    style,
    textStyle
}) {
    const getButtonStyle = () => {
        const baseStyle = [styles.button];

        if (size === 'small') baseStyle.push(styles.buttonSmall);
        if (size === 'large') baseStyle.push(styles.buttonLarge);

        switch (variant) {
            case 'primary':
                baseStyle.push(disabled ? styles.primaryDisabled : styles.primary);
                break;
            case 'secondary':
                baseStyle.push(disabled ? styles.secondaryDisabled : styles.secondary);
                break;
            case 'danger':
                baseStyle.push(disabled ? styles.dangerDisabled : styles.danger);
                break;
            case 'success':
                baseStyle.push(disabled ? styles.successDisabled : styles.success);
                break;
            default:
                baseStyle.push(disabled ? styles.primaryDisabled : styles.primary);
        }

        if (fullWidth) baseStyle.push(styles.fullWidth);

        if (style) baseStyle.push(style);

        return baseStyle;
    };

    const getTextStyle = () => {
        const baseStyle = [styles.text];

        if (size === 'small') baseStyle.push(styles.textSmall);
        if (size === 'large') baseStyle.push(styles.textLarge);

        switch (variant) {
            case 'secondary':
                baseStyle.push(styles.secondaryText);
                break;
            default:
                baseStyle.push(styles.primaryText);
        }

        if (textStyle) baseStyle.push(textStyle);

        return baseStyle;
    };

    return (
        <TouchableOpacity
            style={getButtonStyle()}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'secondary' ? '#2E7D32' : 'white'}
                    size={size === 'small' ? 'small' : 'small'}
                />
            ) : (
                <Text style={getTextStyle()}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    buttonSmall: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 36,
    },
    buttonLarge: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        minHeight: 52,
    },
    fullWidth: {
        width: '100%',
    },
    primary: {
        backgroundColor: '#2E7D32',
    },
    primaryDisabled: {
        backgroundColor: '#ccc',
    },
    secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#2E7D32',
    },
    secondaryDisabled: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    danger: {
        backgroundColor: '#d32f2f',
    },
    dangerDisabled: {
        backgroundColor: '#ffcdd2',
    },
    success: {
        backgroundColor: '#4caf50',
    },
    successDisabled: {
        backgroundColor: '#c8e6c9',
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    textSmall: {
        fontSize: 14,
    },
    textLarge: {
        fontSize: 18,
    },
    primaryText: {
        color: 'white',
    },
    secondaryText: {
        color: '#2E7D32',
    },
});