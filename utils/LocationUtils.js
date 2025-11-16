import * as Location from 'expo-location';

export const requestLocationPermission = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Error requesting location permission:', error);
        return false;
    }
};

export const getCurrentLocation = async () => {
    try {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            throw new Error('Location permission not granted');
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
        });

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error getting location:', error);
        throw error;
    }
};

export const watchLocation = (callback) => {
    return Location.watchPositionAsync(
        {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000,
            distanceInterval: 1
        },
        (location) => {
            callback({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy,
                timestamp: new Date().toISOString()
            });
        }
    );
};