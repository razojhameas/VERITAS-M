import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, StyleSheet, Image } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { calculateSHA256, calculateSHA256FromString } from '../utils/HashingUtils';
import { verifyEvidenceIntegrity } from '../data/apiBlockchain';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function VerifyScreen() {
    const [txId, setTxId] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [textContent, setTextContent] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [currentStep, setCurrentStep] = useState('');
    const [verificationMode, setVerificationMode] = useState('file');

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (result.canceled === false) {
                setSelectedFile(result.assets[0]);
                setVerificationResult(null);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const verifyIntegrity = async () => {
        if (!txId.trim()) {
            Alert.alert('Error', 'Please enter a Transaction ID');
            return;
        }

        if (verificationMode === 'file' && !selectedFile) {
            Alert.alert('Error', 'Please select a file to verify');
            return;
        }

        if (verificationMode === 'text' && !textContent.trim()) {
            Alert.alert('Error', 'Please enter text content to verify');
            return;
        }

        setVerifying(true);
        setVerificationResult(null);

        try {
            let contentHash;

            if (verificationMode === 'file') {
                setCurrentStep('Calculating file integrity hash...');
                contentHash = await calculateSHA256(selectedFile.uri);
            } else {
                setCurrentStep('Calculating text content hash...');
                contentHash = calculateSHA256FromString(textContent);
            }

            setCurrentStep('Verifying against blockchain...');
            const result = await verifyEvidenceIntegrity(txId, contentHash);

            setVerificationResult(result);

            if (result.verified) {
                Alert.alert('Success', 'Integrity confirmed! Content matches blockchain record.');
            } else {
                Alert.alert('Warning', 'Integrity compromised! Content does not match blockchain record.');
            }

        } catch (error) {
            Alert.alert('Error', error.message || 'Verification failed');
            setVerificationResult({
                success: false,
                verified: false,
                error: error.message
            });
        } finally {
            setVerifying(false);
            setCurrentStep('');
        }
    };

    const resetVerification = () => {
        setTxId('');
        setSelectedFile(null);
        setTextContent('');
        setVerificationResult(null);
    };

    const getVerificationColor = () => {
        if (!verificationResult) return '#666';
        if (verificationResult.verified) return '#4caf50';
        return '#f44336';
    };

    const getVerificationIcon = () => {
        if (!verificationResult) return 'help-circle';
        if (verificationResult.verified) return 'checkmark-circle';
        return 'close-circle';
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
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
                                Evidence & FPIC Integrity Verification
                            </Text>
                        </View>
                    </View>
                </View>

                <Card style={styles.inputSection}>
                    <Text style={styles.sectionLabel}>Transaction ID</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter blockchain transaction ID (e.g., 0xabc123...)"
                        value={txId}
                        onChangeText={setTxId}
                        placeholderTextColor="#999"
                        editable={!verifying}
                    />

                    <Text style={styles.sectionLabel}>Verification Type</Text>
                    <View style={styles.modeSelector}>
                        <TouchableOpacity
                            style={[
                                styles.modeOption,
                                verificationMode === 'file' && styles.modeOptionSelected
                            ]}
                            onPress={() => setVerificationMode('file')}
                            disabled={verifying}
                        >
                            <Ionicons
                                name="document"
                                size={20}
                                color={verificationMode === 'file' ? 'white' : '#2E7D32'}
                            />
                            <Text style={[
                                styles.modeText,
                                verificationMode === 'file' && styles.modeTextSelected
                            ]}>
                                File Evidence
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.modeOption,
                                verificationMode === 'text' && styles.modeOptionSelected
                            ]}
                            onPress={() => setVerificationMode('text')}
                            disabled={verifying}
                        >
                            <Ionicons
                                name="text"
                                size={20}
                                color={verificationMode === 'text' ? 'white' : '#2E7D32'}
                            />
                            <Text style={[
                                styles.modeText,
                                verificationMode === 'text' && styles.modeTextSelected
                            ]}>
                                FPIC/Text
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {verificationMode === 'file' && (
                        <>
                            <Text style={styles.sectionLabel}>Evidence File</Text>
                            <TouchableOpacity
                                style={styles.filePicker}
                                onPress={pickDocument}
                                disabled={verifying}
                            >
                                <Ionicons
                                    name={selectedFile ? "document-attach" : "document"}
                                    size={24}
                                    color="#2E7D32"
                                />
                                <View style={styles.fileInfo}>
                                    <Text style={styles.filePickerText}>
                                        {selectedFile ? selectedFile.name : 'Select evidence file to verify'}
                                    </Text>
                                    {selectedFile && (
                                        <Text style={styles.fileSize}>
                                            {selectedFile.size ? `Size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </>
                    )}

                    {verificationMode === 'text' && (
                        <>
                            <Text style={styles.sectionLabel}>Text Content</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                placeholder="Paste or type the text content to verify (e.g., FPIC record details)"
                                value={textContent}
                                onChangeText={setTextContent}
                                placeholderTextColor="#999"
                                editable={!verifying}
                                multiline
                                numberOfLines={4}
                            />
                        </>
                    )}

                    <Button
                        title={verifying ? 'VERIFYING...' : 'VERIFY INTEGRITY'}
                        onPress={verifyIntegrity}
                        disabled={!txId || (verificationMode === 'file' && !selectedFile) || (verificationMode === 'text' && !textContent.trim()) || verifying}
                        loading={verifying}
                        fullWidth
                        style={styles.verifyButton}
                    />
                </Card>

                {verifying && currentStep && (
                    <Card style={styles.progressContainer}>
                        <ActivityIndicator size="small" color="#2E7D32" />
                        <Text style={styles.progressText}>{currentStep}</Text>
                    </Card>
                )}

                {verificationResult && (
                    <Card style={[
                        styles.resultContainer,
                        { borderColor: getVerificationColor() }
                    ]}>
                        <Ionicons
                            name={getVerificationIcon()}
                            size={48}
                            color={getVerificationColor()}
                        />

                        <Text style={[styles.resultTitle, { color: getVerificationColor() }]}>
                            {verificationResult.verified ? 'INTEGRITY CONFIRMED' : 'TAMPERED CONTENT'}
                        </Text>

                        <Text style={styles.resultMessage}>
                            {verificationResult.message}
                        </Text>

                        {verificationResult.originalHash && verificationResult.fileHash && (
                            <View style={styles.hashComparison}>
                                <Text style={styles.hashLabel}>Original Hash (Blockchain):</Text>
                                <Text style={styles.hashValue} numberOfLines={1}>
                                    {verificationResult.originalHash}
                                </Text>

                                <Text style={styles.hashLabel}>Content Hash (Calculated):</Text>
                                <Text style={styles.hashValue} numberOfLines={1}>
                                    {verificationResult.fileHash}
                                </Text>

                                <View style={styles.hashMatch}>
                                    <Ionicons
                                        name={verificationResult.verified ? "checkmark" : "close"}
                                        size={16}
                                        color={verificationResult.verified ? "#4caf50" : "#f44336"}
                                    />
                                    <Text style={[
                                        styles.hashMatchText,
                                        { color: verificationResult.verified ? "#4caf50" : "#f44336" }
                                    ]}>
                                        {verificationResult.verified ? "Hashes match" : "Hashes do not match"}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {!verificationResult.success && verificationResult.error && (
                            <Text style={styles.errorDetails}>
                                Error: {verificationResult.error}
                            </Text>
                        )}

                        <Button
                            title="VERIFY ANOTHER"
                            onPress={resetVerification}
                            variant="secondary"
                            style={styles.resetButton}
                        />
                    </Card>
                )}

                <Card style={styles.instructions}>
                    <Text style={styles.instructionsTitle}>How to Verify Integrity</Text>

                    <View style={styles.instructionStep}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            Enter the blockchain transaction ID from your record
                        </Text>
                    </View>

                    <View style={styles.instructionStep}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            Select verification type: File Evidence or FPIC/Text
                        </Text>
                    </View>

                    <View style={styles.instructionStep}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            Provide the file or text content to verify
                        </Text>
                    </View>

                    <View style={styles.instructionStep}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>4</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            Click "Verify Integrity" to compare with blockchain record
                        </Text>
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
    scrollView: {
        flex: 1,
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
        textAlign: 'center',
        lineHeight: 20,
    },
    inputSection: {
        margin: 16,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#fafafa',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    modeSelector: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    modeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        marginHorizontal: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f8f9fa',
    },
    modeOptionSelected: {
        backgroundColor: '#2E7D32',
        borderColor: '#2E7D32',
    },
    modeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginLeft: 8,
    },
    modeTextSelected: {
        color: 'white',
    },
    filePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        backgroundColor: '#fafafa',
    },
    fileInfo: {
        flex: 1,
        marginLeft: 12,
    },
    filePickerText: {
        fontSize: 14,
        color: '#666',
    },
    fileSize: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    verifyButton: {
        marginTop: 8,
    },
    progressContainer: {
        margin: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#2E7D32',
    },
    resultContainer: {
        alignItems: 'center',
        padding: 24,
        margin: 16,
        borderWidth: 2,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 12,
        textAlign: 'center',
    },
    resultMessage: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 16,
    },
    hashComparison: {
        width: '100%',
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    hashLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    hashValue: {
        fontSize: 11,
        color: '#333',
        fontFamily: 'monospace',
        marginBottom: 12,
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 4,
    },
    hashMatch: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    hashMatchText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    errorDetails: {
        fontSize: 12,
        color: '#d32f2f',
        textAlign: 'center',
        fontFamily: 'monospace',
        marginBottom: 16,
    },
    resetButton: {
        marginTop: 8,
    },
    instructions: {
        margin: 16,
    },
    instructionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    instructionStep: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#2E7D32',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    instructionText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});