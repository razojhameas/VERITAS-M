import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FormInput({
    label,
    value,
    onChangeText,
    placeholder,
    required = false,
    multiline = false,
    numberOfLines = 1,
    error,
    icon,
    ...props
}) {
    return (
        <View style={styles.container}>
            {label && (
                <Text style={styles.label}>
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                </Text>
            )}

            <View style={[
                styles.inputContainer,
                error && styles.inputContainerError,
                multiline && styles.multilineContainer
            ]}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color="#666"
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.multilineInput
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    multiline={multiline}
                    numberOfLines={multiline ? numberOfLines : 1}
                    placeholderTextColor="#999"
                    {...props}
                />
            </View>

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    required: {
        color: '#f44336',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fafafa',
        overflow: 'hidden',
    },
    inputContainerError: {
        borderColor: '#f44336',
    },
    multilineContainer: {
        minHeight: 100,
    },
    icon: {
        padding: 12,
        paddingRight: 0,
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    multilineInput: {
        height: 'auto',
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: 12,
        color: '#f44336',
        marginTop: 4,
    },
});