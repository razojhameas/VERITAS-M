import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CaptureScreen from './screens/CaptureScreen';
import SyncScreen from './screens/SyncScreen';
import DashboardScreen from './screens/DashboardScreen';
import VerifyScreen from './screens/VerifyScreen';
import FPICGuardianScreen from './screens/FPICGuardianScreen';
import LegalComplaintScreen from './screens/LegalComplaintScreen';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, color, size }) => (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={name} size={size} color={color} />
    </View>
);

export default function Navigation({ user }) {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    tabBarStyle: {
                        backgroundColor: 'white',
                        borderTopWidth: 1,
                        borderTopColor: '#e0e0e0',
                        height: 60,
                    },
                    headerStyle: {
                        backgroundColor: '#2E7D32',
                    },
                    headerTintColor: 'white',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    tabBarShowLabel: false,
                    tabBarActiveTintColor: '#2E7D32', // Green for active tabs
                    tabBarInactiveTintColor: '#666', // Gray for inactive tabs
                }}
            >
                <Tab.Screen
                    name="Dashboard"
                    component={DashboardScreen}
                    options={{
                        title: 'EcoRisk Mapper',
                        tabBarIcon: ({ focused, color, size }) => (
                            <TabBarIcon
                                name={focused ? 'map' : 'map-outline'}
                                color={color}
                                size={28}
                            />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Capture"
                    component={CaptureScreen}
                    options={{
                        title: 'EcoEvidence Logger',
                        tabBarIcon: ({ focused, color, size }) => (
                            <TabBarIcon
                                name={focused ? 'camera' : 'camera-outline'}
                                color={color}
                                size={28}
                            />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Sync"
                    component={SyncScreen}
                    options={{
                        title: 'EcoChain Custody',
                        tabBarIcon: ({ focused, color, size }) => (
                            <TabBarIcon
                                name={focused ? 'cloud-upload' : 'cloud-upload-outline'}
                                color={color}
                                size={28}
                            />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Verify"
                    component={VerifyScreen}
                    options={{
                        title: 'EcoChain Custody',
                        tabBarIcon: ({ focused, color, size }) => (
                            <TabBarIcon
                                name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'}
                                color={color}
                                size={28}
                            />
                        ),
                    }}
                />
                <Tab.Screen
                    name="FPIC"
                    component={FPICGuardianScreen}
                    options={{
                        title: 'EcoFPIC Guardian',
                        tabBarIcon: ({ focused, color, size }) => (
                            <TabBarIcon
                                name={focused ? 'document-text' : 'document-text-outline'}
                                color={color}
                                size={28}
                            />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Legal"
                    component={LegalComplaintScreen}
                    options={{
                        title: 'EcoComplaint Generator',
                        tabBarIcon: ({ focused, color, size }) => (
                            <TabBarIcon
                                name={focused ? 'scale' : 'scale-outline'}
                                color={color}
                                size={28}
                            />
                        ),
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}