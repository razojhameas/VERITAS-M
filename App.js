import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Image, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DataProvider } from './context/DataContext';
import Navigation from './Navigation';
import * as SplashScreen from 'expo-splash-screen';
import { testFirestoreConnection } from './data/apiFirebase';


SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState('Initializing VERITAS...');
  const [user, setUser] = useState(null);

  // Strict platform check - only render mobile components
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

  useEffect(() => {
    async function prepare() {
      try {
        setFirebaseStatus('Loading resources...');
        await new Promise(resolve => setTimeout(resolve, 500));

        setFirebaseStatus('Connecting to secure cloud...');
        const firebaseTest = await testFirestoreConnection();

        if (firebaseTest) {
          setFirebaseStatus('Secure cloud connected!');
        } else {
          setFirebaseStatus('Using secure local mode...');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (e) {
        console.warn('App initialization error:', e);
        setFirebaseStatus('Ready for evidence capture...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = {
        id: 'user_001',
        firstName: 'Community',
        lastName: 'Member',
        community: 'Quezon Province',
        role: 'environmental defender'
      };
      if (storedUser) {
        setUser(storedUser);
      }
    };
    loadUser();
  }, []);

  if (!appIsReady) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2E7D32'
      }}>
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 30
        }}>
          <Image
            source={require('./assets/greenIcon.png')}
            style={{
              width: 120,
              height: 120,
              marginBottom: 20
            }}
            resizeMode="contain"
          />
          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 10
          }}>
            VERITAS
          </Text>
          <Text style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.8)',
            marginBottom: 5
          }}>
            Environmental Justice Intelligence System
          </Text>
        </View>

        <ActivityIndicator size="large" color="white" />
        <Text style={{
          color: 'white',
          marginTop: 20,
          fontSize: 16,
          textAlign: 'center'
        }}>
          {firebaseStatus}
        </Text>
      </View>
    );
  }

  // Strict platform enforcement
  if (!isMobile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2E7D32' }}>
        <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>
          VERITAS is only available on mobile devices
        </Text>
      </View>
    );
  }

  return (
    <DataProvider user={user}>
      <StatusBar style="light" />
      <Navigation user={user} />
    </DataProvider>
  );
}