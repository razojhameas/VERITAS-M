import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { getCurrentLocation } from '../utils/LocationUtils';
import { calculateSHA256 } from '../utils/HashingUtils';
import { useFocusEffect } from '@react-navigation/native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CaptureScreen() {
    const [hasPermission, setHasPermission] = useState(null);
    const [audioPermission, setAudioPermission] = useState(null);
    const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
    const [isRecording, setIsRecording] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraKey, setCameraKey] = useState(0);
    const cameraRef = useRef(null);
    const { addRecord } = useData();

    useEffect(() => {
        (async () => {
            try {
                const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
                setHasPermission(cameraStatus === 'granted');

                const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
                setAudioPermission(audioStatus === 'granted');

                setLocationLoading(true);
                getCurrentLocation()
                    .then(location => {
                        setCurrentLocation(location);
                        setLocationLoading(false);
                    })
                    .catch(error => {
                        setLocationLoading(false);
                    });

            } catch (error) {
                setHasPermission(false);
            }
        })();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            setCameraReady(false);
            setCameraKey(prev => prev + 1);

            return () => {
                if (isRecording && cameraRef.current) {
                    cameraRef.current.stopRecording();
                    setIsRecording(false);
                }
            };
        }, [isRecording])
    );

    const onCameraReady = () => {
        setCameraReady(true);
    };

    const onCameraError = (error) => {
        Alert.alert('Camera Error', 'Failed to initialize camera. Please restart the app.');
        setCameraReady(false);
    };

    const restartCamera = () => {
        setCameraReady(false);
        setCameraKey(prev => prev + 1);
    };

    const takePicture = async () => {
        if (cameraRef.current && cameraReady) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.7,
                    exif: true,
                    skipProcessing: false
                });

                await saveEvidence(photo.uri, 'photo');

                Alert.alert('Success', 'Evidence captured successfully!');
            } catch (error) {
                Alert.alert('Error', 'Failed to capture evidence. Camera may need to be restarted.');
                restartCamera();
            }
        } else {
            Alert.alert('Camera Not Ready', 'Please wait for camera to initialize or restart the camera.');
            restartCamera();
        }
    };

    const startRecording = async () => {
        if (cameraRef.current && cameraReady) {
            if (audioPermission !== 'granted') {
                Alert.alert('Audio Permission Required', 'Please grant microphone permission to record video with audio.');
                return;
            }

            try {
                setIsRecording(true);
                const video = await cameraRef.current.recordAsync({
                    quality: Camera.Constants.VideoQuality['480p'],
                    maxDuration: 30,
                    mute: false
                });

                await saveEvidence(video.uri, 'video');

                Alert.alert('Success', 'Video evidence captured successfully!');
            } catch (error) {
                Alert.alert('Error', 'Failed to record video');
                restartCamera();
            } finally {
                setIsRecording(false);
            }
        } else {
            Alert.alert('Camera Not Ready', 'Please wait for camera to initialize.');
            restartCamera();
        }
    };

    const stopRecording = () => {
        if (cameraRef.current && isRecording) {
            cameraRef.current.stopRecording();
            setIsRecording(false);
        }
    };

    const saveEvidence = async (fileUri, type) => {
        try {
            let locationData = currentLocation;
            if (!locationData) {
                try {
                    locationData = await getCurrentLocation();
                    setCurrentLocation(locationData);
                } catch (error) {
                    locationData = {
                        latitude: 0,
                        longitude: 0,
                        accuracy: 0,
                        timestamp: new Date().toISOString()
                    };
                }
            }

            const fileName = `${type}_${Date.now()}.${type === 'photo' ? 'jpg' : 'mp4'}`;
            const newPath = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.moveAsync({
                from: fileUri,
                to: newPath
            });

            const sha256Hash = await calculateSHA256(newPath);

            const record = {
                type,
                fileUri: newPath,
                fileName,
                location: locationData,
                timestamp: new Date().toISOString(),
                syncStatus: 'LOCAL_ONLY',
                sha256Hash,
                blockchainTxId: null
            };

            await addRecord(record);
        } catch (error) {
            Alert.alert('Error', 'Failed to save evidence. Please try again.');
            throw error;
        }
    };

    if (hasPermission === null) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.text}>Requesting camera permission...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="camera-off" size={64} color="#666" />
                <Text style={styles.text}>No access to camera</Text>
                <Text style={styles.subText}>
                    Please enable camera permissions in your device settings
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={restartCamera}>
                    <Text style={styles.retryButtonText}>Retry Camera</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Camera
                key={cameraKey}
                ref={cameraRef}
                style={styles.camera}
                type={cameraType}
                ratio="16:9"
                onCameraReady={onCameraReady}
                onMountError={onCameraError}
            >
                <View style={styles.overlay}>
                    <View style={styles.locationBanner}>
                        <Ionicons name="lock-closed" size={16} color="white" />
                        <Text style={styles.locationText}>
                            {locationLoading
                                ? 'Acquiring location...'
                                : currentLocation
                                    ? `Lat: ${currentLocation.latitude.toFixed(6)}, Lng: ${currentLocation.longitude.toFixed(6)}`
                                    : 'Location unavailable'
                            }
                        </Text>
                        <Text style={styles.timestamp}>
                            {new Date().toLocaleTimeString()}
                        </Text>
                    </View>

                    <View style={styles.controlsContainer}>
                        <View style={styles.topControls}>
                            <TouchableOpacity
                                style={styles.flipButton}
                                onPress={() => setCameraType(
                                    cameraType === Camera.Constants.Type.back
                                        ? Camera.Constants.Type.front
                                        : Camera.Constants.Type.back
                                )}
                            >
                                <Ionicons name="camera-reverse" size={28} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.restartButton}
                                onPress={restartCamera}
                            >
                                <Ionicons name="refresh" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bottomControls}>
                            <View style={styles.mainControls}>
                                {!isRecording ? (
                                    <>
                                        <TouchableOpacity
                                            style={styles.captureButton}
                                            onPress={takePicture}
                                            disabled={!cameraReady}
                                        >
                                            <View style={styles.captureButtonOuter}>
                                                <View style={styles.captureButtonInner} />
                                            </View>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.videoButton,
                                                !cameraReady && styles.buttonDisabled
                                            ]}
                                            onPress={startRecording}
                                            disabled={!cameraReady}
                                        >
                                            <Ionicons name="videocam" size={32} color="white" />
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <TouchableOpacity style={styles.recordingButton} onPress={stopRecording}>
                                        <View style={styles.recordingIndicator} />
                                        <Text style={styles.recordingText}>STOP</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>

                    {!cameraReady && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#2E7D32" />
                            <Text style={styles.loadingText}>Initializing Camera...</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={restartCamera}>
                                <Text style={styles.retryButtonText}>Retry Camera</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Camera>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    locationBanner: {
        backgroundColor: 'rgba(46, 125, 50, 0.8)',
        padding: 12,
        margin: 16,
        marginTop: 40,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    locationText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        marginLeft: 8,
    },
    timestamp: {
        color: 'white',
        fontSize: 12,
        opacity: 0.8,
    },
    controlsContainer: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
    },
    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    flipButton: {
        padding: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 25,
    },
    restartButton: {
        padding: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 25,
    },
    bottomControls: {
        alignItems: 'center',
    },
    mainControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    captureButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 30,
    },
    captureButtonOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#2E7D32',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2E7D32',
    },
    videoButton: {
        padding: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 25,
        marginLeft: 20,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    recordingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff4444',
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 25,
    },
    recordingIndicator: {
        width: 20,
        height: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        marginRight: 10,
    },
    recordingText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'white',
        fontSize: 16,
        marginTop: 16,
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#2E7D32',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    text: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        textAlign: 'center',
    },
    subText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
});