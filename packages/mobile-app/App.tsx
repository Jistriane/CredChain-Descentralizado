import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';
import SplashScreen from 'react-native-splash-screen';

// Contexts
import { AuthProvider } from './src/contexts/AuthContext';
import { SocketProvider } from './src/contexts/SocketContext';
import { NotificationProvider } from './src/contexts/NotificationContext';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import ScoreScreen from './src/screens/score/ScoreScreen';
import PaymentScreen from './src/screens/payment/PaymentScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import ChatScreen from './src/screens/chat/ChatScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';
import { SplashScreen } from './src/screens/splash/SplashScreen';

// Components
import TabBarIcon from './src/components/common/TabBarIcon';
import LoadingScreen from './src/components/common/LoadingScreen';

// Utils
import { theme } from './src/utils/theme';
import { useAuth } from './src/hooks/useAuth';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon name={route.name} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray,
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopColor: theme.colors.lightGray,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Início' }}
      />
      <Tab.Screen 
        name="Score" 
        component={ScoreScreen}
        options={{ title: 'Score' }}
      />
      <Tab.Screen 
        name="Payment" 
        component={PaymentScreen}
        options={{ title: 'Pagamentos' }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// Main App Component
function AppContent() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);

  useEffect(() => {
    // Hide native splash screen
    SplashScreen.hide();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onAnimationFinish={handleSplashFinish} />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <SocketProvider>
                <NotificationProvider>
                  <AppContent />
                  <FlashMessage position="top" />
                  <StatusBar style="auto" />
                </NotificationProvider>
              </SocketProvider>
            </AuthProvider>
          </QueryClientProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
