import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { calculateSHA256FromString } from '../utils/HashingUtils';

export default function FPICGuardianScreen() {
    const { user, addRecord } = useData();
    const [showFormCreator, setShowFormCreator] = useState(false);

    const [formData, setFormData] = useState({
        projectName: '',
        consultationDate: new Date().toISOString().split('T')[0],
        communityConsensus: '',
        developer: '',
        location: '',
        community: user?.community || '',
        description: '',
        participants: '',
        terms: ''
    });

    const createFPICRecord = async () => {
        if (!formData.projectName || !formData.consultationDate || !formData.communityConsensus) {
            Alert.alert('Error', 'Please fill in all required fields: Project Name, Consultation Date, and Community Consensus');
            return;
        }

        try {
            const recordString = JSON.stringify({
                projectName: formData.projectName,
                consultationDate: formData.consultationDate,
                communityConsensus: formData.communityConsensus,
                community: formData.community,
                timestamp: new Date().toISOString()
            });

            const fpicHash = calculateSHA256FromString(recordString);

            const fpicRecord = {
                id: `fpic_${Date.now()}`,
                type: 'fpic_record',
                projectName: formData.projectName,
                consultationDate: formData.consultationDate,
                communityConsensus: formData.communityConsensus,
                developer: formData.developer,
                location: formData.location,
                community: formData.community,
                description: formData.description,
                participants: formData.participants,
                terms: formData.terms,
                timestamp: new Date().toISOString(),
                syncStatus: 'LOCAL_ONLY',
                sha256Hash: fpicHash,
                blockchainTxId: null,
                createdBy: user?.firstName || 'Community Member',
                recordType: 'FPIC'
            };

            await addRecord(fpicRecord);

            setShowFormCreator(false);
            setFormData({
                projectName: '',
                consultationDate: new Date().toISOString().split('T')[0],
                communityConsensus: '',
                developer: '',
                location: '',
                community: user?.community || '',
                description: '',
                participants: '',
                terms: ''
            });

            Alert.alert('Success', 'FPIC record created with digital certificate!');
        } catch (error) {
            Alert.alert('Error', 'Failed to create FPIC record');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.title}>EcoFPIC Guardian</Text>
                    <Text style={styles.subtitle}>
                        Free, Prior & Informed Consent Management
                    </Text>
                </View>

                <Card style={styles.createCard}>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => setShowFormCreator(true)}
                    >
                        <Ionicons name="add-circle" size={24} color="#2E7D32" />
                        <Text style={styles.createButtonText}>Create New FPIC Record</Text>
                    </TouchableOpacity>
                </Card>

                {showFormCreator && (
                    <Card style={styles.formCreator}>
                        <Text style={styles.formTitle}>Create FPIC Consent Record</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Project Name *"
                            value={formData.projectName}
                            onChangeText={text => setFormData(prev => ({ ...prev, projectName: text }))}
                        />

                        <Text style={styles.inputLabel}>Consultation Date *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.consultationDate}
                            onChangeText={text => setFormData(prev => ({ ...prev, consultationDate: text }))}
                            placeholder="YYYY-MM-DD"
                        />

                        <Text style={styles.inputLabel}>Community Consensus Status *</Text>
                        <View style={styles.consensusOptions}>
                            {['Granted', 'Withdrawn', 'Pending', 'Conditional'].map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.consensusOption,
                                        formData.communityConsensus === status && styles.consensusOptionSelected
                                    ]}
                                    onPress={() => setFormData(prev => ({ ...prev, communityConsensus: status }))}
                                >
                                    <Text style={[
                                        styles.consensusOptionText,
                                        formData.communityConsensus === status && styles.consensusOptionTextSelected
                                    ]}>
                                        {status}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Developer/Company"
                            value={formData.developer}
                            onChangeText={text => setFormData(prev => ({ ...prev, developer: text }))}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Location"
                            value={formData.location}
                            onChangeText={text => setFormData(prev => ({ ...prev, location: text }))}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Community"
                            value={formData.community}
                            onChangeText={text => setFormData(prev => ({ ...prev, community: text }))}
                        />

                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Project Description"
                            value={formData.description}
                            onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
                            multiline
                            numberOfLines={3}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Number of Participants"
                            value={formData.participants}
                            onChangeText={text => setFormData(prev => ({ ...prev, participants: text }))}
                            keyboardType="numeric"
                        />

                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Terms and Conditions"
                            value={formData.terms}
                            onChangeText={text => setFormData(prev => ({ ...prev, terms: text }))}
                            multiline
                            numberOfLines={4}
                        />

                        <View style={styles.formActions}>
                            <Button
                                title="Cancel"
                                variant="secondary"
                                onPress={() => setShowFormCreator(false)}
                                style={styles.formButton}
                            />
                            <Button
                                title="Create FPIC Record"
                                onPress={createFPICRecord}
                                style={styles.formButton}
                            />
                        </View>
                    </Card>
                )}

                <Card style={styles.infoCard}>
                    <Text style={styles.infoTitle}>About FPIC</Text>
                    <Text style={styles.infoText}>
                        Free, Prior and Informed Consent (FPIC) is a specific right that allows
                        indigenous communities to give or withhold consent to projects that may
                        affect them or their territories.
                    </Text>
                    <View style={styles.points}>
                        <Text style={styles.point}>• FREE: Without coercion or manipulation</Text>
                        <Text style={styles.point}>• PRIOR: Before project authorization</Text>
                        <Text style={styles.point}>• INFORMED: With complete understanding</Text>
                        <Text style={styles.point}>• CONSENT: Agreement through community processes</Text>
                    </View>
                </Card>

                <Card style={styles.instructionsCard}>
                    <Text style={styles.instructionsTitle}>How It Works</Text>
                    <View style={styles.instructionStep}>
                        <Text style={styles.stepNumber}>1</Text>
                        <Text style={styles.instructionText}>Document FPIC consultation details</Text>
                    </View>
                    <View style={styles.instructionStep}>
                        <Text style={styles.stepNumber}>2</Text>
                        <Text style={styles.instructionText}>Record community consensus status</Text>
                    </View>
                    <View style={styles.instructionStep}>
                        <Text style={styles.stepNumber}>3</Text>
                        <Text style={styles.instructionText}>Generate digital certificate with unique hash</Text>
                    </View>
                    <View style={styles.instructionStep}>
                        <Text style={styles.stepNumber}>4</Text>
                        <Text style={styles.instructionText}>Sync to blockchain for permanent verification</Text>
                    </View>
                </Card>
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
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    createCard: {
        margin: 16,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    createButtonText: {
        fontSize: 16,
        color: '#2E7D32',
        fontWeight: '600',
        marginLeft: 8,
    },
    formCreator: {
        margin: 16,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
        backgroundColor: '#fafafa',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    consensusOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    consensusOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        marginRight: 8,
        marginBottom: 8,
    },
    consensusOptionSelected: {
        backgroundColor: '#2E7D32',
        borderColor: '#2E7D32',
    },
    consensusOptionText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    consensusOptionTextSelected: {
        color: 'white',
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    formButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    infoCard: {
        margin: 16,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    points: {
        marginLeft: 8,
    },
    point: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    instructionsCard: {
        margin: 16,
        marginBottom: 20,
    },
    instructionsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    instructionStep: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#2E7D32',
        color: 'white',
        textAlign: 'center',
        lineHeight: 20,
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 12,
    },
    instructionText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});