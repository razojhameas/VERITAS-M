import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { simulateBlockchainCommit } from '../data/apiBlockchain';

export default function LegalComplaintScreen() {
    const { user, records } = useData();
    const [activeTemplate, setActiveTemplate] = useState(null);
    const [formData, setFormData] = useState({});
    const [generatedDocument, setGeneratedDocument] = useState(null);
    const [selectedEvidence, setSelectedEvidence] = useState([]);
    const [showEvidenceModal, setShowEvidenceModal] = useState(false);

    const legalTemplates = [
        {
            id: 'environmental_complaint',
            title: 'Environmental Complaint',
            description: 'Formal complaint for environmental violations',
            icon: 'leaf',
            color: '#4caf50',
            fields: [
                { name: 'violator_name', label: 'Violator Name/Company', type: 'text', required: true },
                { name: 'violation_type', label: 'Type of Violation', type: 'text', required: true },
                { name: 'location', label: 'Violation Location', type: 'text', required: true },
                { name: 'date_observed', label: 'Date Observed', type: 'date', required: true },
                { name: 'description', label: 'Detailed Description', type: 'textarea', required: true },
                { name: 'impact', label: 'Environmental Impact', type: 'textarea', required: true },
                { name: 'witnesses', label: 'Witnesses', type: 'textarea' },
                { name: 'authority', label: 'Receiving Authority', type: 'text', required: true }
            ]
        },
        {
            id: 'legal_petition',
            title: 'Legal Petition',
            description: 'Formal petition for legal action',
            icon: 'scale',
            color: '#2196f3',
            fields: [
                { name: 'case_title', label: 'Case Title', type: 'text', required: true },
                { name: 'respondent', label: 'Respondent', type: 'text', required: true },
                { name: 'court', label: 'Court/Jurisdiction', type: 'text', required: true },
                { name: 'relief', label: 'Relief Sought', type: 'textarea', required: true },
                { name: 'facts', label: 'Statement of Facts', type: 'textarea', required: true },
                { name: 'legal_basis', label: 'Legal Basis', type: 'textarea', required: true }
            ]
        },
        {
            id: 'fpic_violation',
            title: 'FPIC Violation Report',
            description: 'Report violations of indigenous rights',
            icon: 'people',
            color: '#ff9800',
            fields: [
                { name: 'project_name', label: 'Project Name', type: 'text', required: true },
                { name: 'company', label: 'Company/Developer', type: 'text', required: true },
                { name: 'community', label: 'Affected Community', type: 'text', required: true },
                { name: 'violation_date', label: 'Violation Date', type: 'date', required: true },
                { name: 'violation_type', label: 'Type of FPIC Violation', type: 'textarea', required: true },
                { name: 'impact', label: 'Community Impact', type: 'textarea', required: true },
                { name: 'previous_actions', label: 'Previous Actions Taken', type: 'textarea' }
            ]
        }
    ];

    const evidenceRecords = records.filter(record =>
        record.type === 'photo' || record.type === 'video'
    );

    const handleInputChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    const toggleEvidenceSelection = (record) => {
        setSelectedEvidence(prev => {
            const isSelected = prev.find(r => r.id === record.id);
            if (isSelected) {
                return prev.filter(r => r.id !== record.id);
            } else {
                return [...prev, record];
            }
        });
    };

    const generateDocument = () => {
        const requiredFields = activeTemplate.fields.filter(field => field.required);
        const missingFields = requiredFields.filter(field => !formData[field.name]);

        if (missingFields.length > 0) {
            Alert.alert('Error', `Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
            return;
        }

        const document = generateDocumentContent(activeTemplate, formData, user, selectedEvidence);
        setGeneratedDocument(document);

        Alert.alert('Success', 'Legal document generated successfully');
    };

    const generateDocumentContent = (template, data, user, evidence) => {
        const date = new Date().toLocaleDateString();
        const evidenceList = evidence.map(record =>
            `- ${record.fileName} (${record.type}) - Location: ${record.location?.latitude?.toFixed(4)}, ${record.location?.longitude?.toFixed(4)}`
        ).join('\n');

        switch (template.id) {
            case 'environmental_complaint':
                return `ENVIRONMENTAL COMPLAINT

Date: ${date}
Complainant: ${user?.firstName} ${user?.lastName} || Community Member
Community: ${user?.community || 'Not specified'}

VIOLATION DETAILS:
Violator: ${data.violator_name}
Violation Type: ${data.violation_type}
Location: ${data.location}
Date Observed: ${data.date_observed}

DESCRIPTION:
${data.description}

ENVIRONMENTAL IMPACT:
${data.impact}

${data.witnesses ? `WITNESSES:\n${data.witnesses}` : ''}

SUPPORTING EVIDENCE:
${evidenceList || 'No evidence attached'}

SUBMITTED TO: ${data.authority}

This complaint is supported by ${evidence.length} verified evidence records secured on blockchain.

--- VERITAS Environmental Justice System ---`;

            case 'legal_petition':
                return `LEGAL PETITION

Case Title: ${data.case_title}
Petitioner: ${user?.firstName} ${user?.lastName} || Community Representative
Respondent: ${data.respondent}
Court: ${data.court}
Date: ${date}

RELIEF SOUGHT:
${data.relief}

STATEMENT OF FACTS:
${data.facts}

LEGAL BASIS:
${data.legal_basis}

SUPPORTING EVIDENCE:
${evidenceList || 'No evidence attached'}

This petition is backed by blockchain-verified evidence from the VERITAS system.

--- VERITAS Legal Assistance Platform ---`;

            case 'fpic_violation':
                return `FPIC VIOLATION REPORT

Project: ${data.project_name}
Company: ${data.company}
Affected Community: ${data.community}
Report Date: ${date}
Reported By: ${user?.firstName} ${user?.lastName}

VIOLATION DETAILS:
Date: ${data.violation_date}
Type: ${data.violation_type}

COMMUNITY IMPACT:
${data.impact}

${data.previous_actions ? `PREVIOUS ACTIONS:\n${data.previous_actions}` : ''}

SUPPORTING EVIDENCE:
${evidenceList || 'No evidence attached'}

This report documents violations of Free, Prior and Informed Consent rights.

--- VERITAS FPIC Guardian System ---`;

            default:
                return 'Document template not found';
        }
    };

    const saveToBlockchain = async () => {
        try {
            const metadata = {
                type: 'legal_document',
                template: activeTemplate.id,
                title: activeTemplate.title,
                user: user?.id || 'anonymous',
                timestamp: new Date().toISOString(),
                evidenceCount: selectedEvidence.length
            };

            const txId = await simulateBlockchainCommit(generatedDocument, metadata);

            Alert.alert('Success', `Document secured on blockchain\nTransaction: ${txId}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to secure document on blockchain');
        }
    };

    const resetForm = () => {
        setActiveTemplate(null);
        setFormData({});
        setGeneratedDocument(null);
        setSelectedEvidence([]);
    };

    const renderField = (field) => {
        switch (field.type) {
            case 'textarea':
                return (
                    <TextInput
                        key={field.name}
                        style={[styles.input, styles.textArea]}
                        placeholder={field.label + (field.required ? ' *' : '')}
                        value={formData[field.name] || ''}
                        onChangeText={(text) => handleInputChange(field.name, text)}
                        multiline
                        numberOfLines={4}
                    />
                );
            default:
                return (
                    <TextInput
                        key={field.name}
                        style={styles.input}
                        placeholder={field.label + (field.required ? ' *' : '')}
                        value={formData[field.name] || ''}
                        onChangeText={(text) => handleInputChange(field.name, text)}
                    />
                );
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.title}>EcoComplaint Generator</Text>
                    <Text style={styles.subtitle}>
                        AI-assisted legal document generation
                    </Text>
                </View>

                {!activeTemplate ? (
                    <View style={styles.templatesSection}>
                        <Card style={styles.templatesCard}>
                            <Text style={styles.sectionTitle}>Legal Document Templates</Text>
                            <Text style={styles.sectionSubtitle}>
                                Select a template to generate standardized legal documents
                            </Text>

                            {legalTemplates.map((template) => (
                                <TouchableOpacity
                                    key={template.id}
                                    style={styles.templateItem}
                                    onPress={() => setActiveTemplate(template)}
                                >
                                    <View style={[styles.templateIcon, { backgroundColor: template.color }]}>
                                        <Ionicons name={template.icon} size={24} color="white" />
                                    </View>
                                    <View style={styles.templateInfo}>
                                        <Text style={styles.templateTitle}>{template.title}</Text>
                                        <Text style={styles.templateDescription}>
                                            {template.description}
                                        </Text>
                                        <Text style={styles.templateFields}>
                                            {template.fields.length} fields • {template.fields.filter(f => f.required).length} required
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                                </TouchableOpacity>
                            ))}
                        </Card>

                        <Card style={styles.infoCard}>
                            <Text style={styles.infoTitle}>How It Works</Text>
                            <View style={styles.infoSteps}>
                                <View style={styles.infoStep}>
                                    <Text style={styles.stepNumber}>1</Text>
                                    <Text style={styles.stepText}>Select a legal document template</Text>
                                </View>
                                <View style={styles.infoStep}>
                                    <Text style={styles.stepNumber}>2</Text>
                                    <Text style={styles.stepText}>Fill in the required information</Text>
                                </View>
                                <View style={styles.infoStep}>
                                    <Text style={styles.stepNumber}>3</Text>
                                    <Text style={styles.stepText}>Attach evidence from your records</Text>
                                </View>
                                <View style={styles.infoStep}>
                                    <Text style={styles.stepNumber}>4</Text>
                                    <Text style={styles.stepText}>Generate and secure on blockchain</Text>
                                </View>
                            </View>
                        </Card>
                    </View>
                ) : generatedDocument ? (
                    <Card style={styles.documentCard}>
                        <View style={styles.documentHeader}>
                            <Ionicons name={activeTemplate.icon} size={24} color={activeTemplate.color} />
                            <Text style={styles.documentTitle}>{activeTemplate.title}</Text>
                            <TouchableOpacity onPress={resetForm}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.documentContent}>
                            <Text style={styles.documentText}>{generatedDocument}</Text>
                        </ScrollView>

                        <View style={styles.documentActions}>
                            <Button
                                title="Save to Blockchain"
                                onPress={saveToBlockchain}
                                variant="primary"
                                style={styles.actionButton}
                            />
                            <Button
                                title="Create Another"
                                onPress={resetForm}
                                variant="secondary"
                                style={styles.actionButton}
                            />
                        </View>
                    </Card>
                ) : (
                    <Card style={styles.formCard}>
                        <View style={styles.formHeader}>
                            <View style={styles.formTitleSection}>
                                <Ionicons name={activeTemplate.icon} size={24} color={activeTemplate.color} />
                                <Text style={styles.formTitle}>{activeTemplate.title}</Text>
                            </View>
                            <TouchableOpacity onPress={resetForm}>
                                <Ionicons name="arrow-back" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.formDescription}>
                            {activeTemplate.description}
                        </Text>

                        <View style={styles.formFields}>
                            {activeTemplate.fields.map(renderField)}
                        </View>

                        <View style={styles.evidenceSection}>
                            <Text style={styles.sectionLabel}>Attach Evidence ({selectedEvidence.length} selected)</Text>
                            <Button
                                title="SELECT EVIDENCE"
                                onPress={() => setShowEvidenceModal(true)}
                                variant="secondary"
                                fullWidth
                                style={styles.evidenceButton}
                            />

                            {selectedEvidence.length > 0 && (
                                <View style={styles.selectedEvidence}>
                                    {selectedEvidence.map(record => (
                                        <View key={record.id} style={styles.evidenceItem}>
                                            <Ionicons
                                                name={record.type === 'photo' ? 'image' : 'videocam'}
                                                size={16}
                                                color="#2E7D32"
                                            />
                                            <Text style={styles.evidenceText} numberOfLines={1}>
                                                {record.fileName}
                                            </Text>
                                            <TouchableOpacity onPress={() => toggleEvidenceSelection(record)}>
                                                <Ionicons name="close" size={16} color="#666" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        <Button
                            title="GENERATE LEGAL DOCUMENT"
                            onPress={generateDocument}
                            fullWidth
                            style={styles.generateButton}
                        />
                    </Card>
                )}
            </ScrollView>

            <Modal
                visible={showEvidenceModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Evidence</Text>
                        <TouchableOpacity onPress={() => setShowEvidenceModal(false)}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {evidenceRecords.length === 0 ? (
                            <View style={styles.emptyEvidence}>
                                <Ionicons name="document" size={48} color="#ccc" />
                                <Text style={styles.emptyEvidenceText}>No evidence available</Text>
                                <Text style={styles.emptyEvidenceSubtext}>
                                    Capture photos or videos first to attach them to legal documents
                                </Text>
                            </View>
                        ) : (
                            evidenceRecords.map(record => (
                                <TouchableOpacity
                                    key={record.id}
                                    style={[
                                        styles.evidenceOption,
                                        selectedEvidence.find(r => r.id === record.id) && styles.evidenceOptionSelected
                                    ]}
                                    onPress={() => toggleEvidenceSelection(record)}
                                >
                                    <Ionicons
                                        name={record.type === 'photo' ? 'image' : 'videocam'}
                                        size={20}
                                        color={selectedEvidence.find(r => r.id === record.id) ? "white" : "#2E7D32"}
                                    />
                                    <View style={styles.evidenceInfo}>
                                        <Text style={[
                                            styles.evidenceName,
                                            selectedEvidence.find(r => r.id === record.id) && styles.evidenceNameSelected
                                        ]}>
                                            {record.fileName}
                                        </Text>
                                        <Text style={[
                                            styles.evidenceDetails,
                                            selectedEvidence.find(r => r.id === record.id) && styles.evidenceDetailsSelected
                                        ]}>
                                            {record.type} • {new Date(record.timestamp).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    {selectedEvidence.find(r => r.id === record.id) && (
                                        <Ionicons name="checkmark" size={20} color="white" />
                                    )}
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <Button
                            title="DONE"
                            onPress={() => setShowEvidenceModal(false)}
                            fullWidth
                        />
                    </View>
                </View>
            </Modal>
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
    templatesSection: {
        padding: 16,
    },
    templatesCard: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        lineHeight: 20,
    },
    templateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    templateIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    templateInfo: {
        flex: 1,
    },
    templateTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    templateDescription: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    templateFields: {
        fontSize: 10,
        color: '#999',
    },
    infoCard: {
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    infoSteps: {
        marginLeft: 8,
    },
    infoStep: {
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
    stepText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    formCard: {
        margin: 16,
    },
    formHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    formTitleSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    formDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 20,
    },
    formFields: {
        marginBottom: 20,
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    evidenceSection: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    evidenceButton: {
        marginBottom: 12,
    },
    selectedEvidence: {
        marginTop: 8,
    },
    evidenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    evidenceText: {
        flex: 1,
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
    generateButton: {
        marginTop: 8,
    },
    documentCard: {
        margin: 16,
    },
    documentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    documentTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    documentContent: {
        maxHeight: 400,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
    },
    documentText: {
        fontSize: 12,
        color: '#333',
        lineHeight: 18,
        fontFamily: 'monospace',
    },
    documentActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    emptyEvidence: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyEvidenceText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyEvidenceSubtext: {
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
    },
    evidenceOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 8,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    evidenceOptionSelected: {
        backgroundColor: '#2E7D32',
        borderColor: '#2E7D32',
    },
    evidenceInfo: {
        flex: 1,
        marginLeft: 12,
    },
    evidenceName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    evidenceNameSelected: {
        color: 'white',
    },
    evidenceDetails: {
        fontSize: 12,
        color: '#666',
    },
    evidenceDetailsSelected: {
        color: 'rgba(255,255,255,0.8)',
    },
    modalActions: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
});