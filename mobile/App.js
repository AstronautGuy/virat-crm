import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Use Vercel URL for the production APK build
const TARGET_URL = 'https://virat-crm.vercel.app';
const LOCATION_TASK_NAME = 'BACKGROUND_LOCATION_TASK';
const NOTIFICATION_TASK_NAME = 'BACKGROUND_NOTIFICATION_TASK';

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    const loc = locations[0];
    if (loc) {
      try {
        // Send location to the tRPC ping endpoint
        // Native fetch shares cookies with the WebView automatically on most platforms
        const response = await fetch(`${TARGET_URL}/api/trpc/location.logBreadcrumb`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            json: {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              accuracy: loc.coords.accuracy,
            }
          }),
        });
        
        if (!response.ok) {
          console.warn('Failed to ping location in background:', response.status);
        }
      } catch (err) {
        console.error('Network error in background location ping:', err);
      }
    }
  }
});

let lastUnreadCount = 0;

TaskManager.defineTask(NOTIFICATION_TASK_NAME, async () => {
  try {
    const response = await fetch(`${TARGET_URL}/api/trpc/notifications.getUnreadCount`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      const unreadCount = data?.result?.data?.count || 0;
      
      if (unreadCount > 0 && unreadCount !== lastUnreadCount) {
        lastUnreadCount = unreadCount;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Virat CRM Alerts",
            body: `You have ${unreadCount} unread low-stock alerts!`,
            sound: true,
          },
          trigger: null,
        });
      }
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (err) {
    console.error('Background notification fetch error:', err);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export default function App() {
  const webviewRef = useRef(null);
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Request Foreground permissions first
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') {
          console.warn('Foreground location permission denied.');
          return;
        }

        // Request Background permissions (may fail in Expo Go)
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.warn('Background location permission denied.');
          return;
        }

        // Request Notifications permissions
        const { status: notifStatus } = await Notifications.requestPermissionsAsync();
        if (notifStatus !== 'granted') {
          console.warn('Notification permission denied.');
        }

        setHasPermissions(true);

        // Register background fetch for notifications
        await BackgroundFetch.registerTaskAsync(NOTIFICATION_TASK_NAME, {
          minimumInterval: 15 * 60, // 15 minutes
          stopOnTerminate: false,
          startOnBoot: true,
        });

        // Start background location tracking
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 60000,
          distanceInterval: 50,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'Virat CRM Tracking',
            notificationBody: 'Your location is being tracked for attendance.',
            notificationColor: '#ff0000',
          },
        });

        // Ping immediately on load so we don't have to wait for movement
        const currentLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (currentLoc) {
          fetch(`${TARGET_URL}/api/trpc/location.logBreadcrumb`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              json: {
                latitude: currentLoc.coords.latitude,
                longitude: currentLoc.coords.longitude,
                accuracy: currentLoc.coords.accuracy,
              }
            }),
          }).catch(console.warn);
        }
      } catch (e) {
        console.warn("Background location setup failed (expected if running in Expo Go):", e);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ uri: TARGET_URL }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        geolocationEnabled={true} // Allow the web app's own navigator.geolocation to work
        allowsInlineMediaPlayback={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // Minimal safe area padding could be added here if needed
  },
  webview: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 44 : 24, // Basic safe area adjustment
  },
});
