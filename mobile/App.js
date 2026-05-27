import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Platform, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

async function syncLocationQueue() {
  try {
    const queueStr = await AsyncStorage.getItem('location_queue');
    if (!queueStr) return;
    const queue = JSON.parse(queueStr);
    if (!queue || queue.length === 0) return;

    const response = await fetch(`${TARGET_URL}/api/trpc/location.logBreadcrumbBatch`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: { locations: queue }
      }),
    });

    if (response.ok) {
      // Clear queue and update last sync
      await AsyncStorage.removeItem('location_queue');
      await AsyncStorage.setItem('last_successful_sync', Date.now().toString());
      await AsyncStorage.setItem('is_locked_out', 'false');
    }
  } catch (err) {
    console.log('Failed to sync location batch:', err.message);
  }
}

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
        // 1. Get Time Offset
        const offsetStr = await AsyncStorage.getItem('time_offset');
        const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
        const accurateTimestamp = Date.now() + offset;

        // 2. Add to Queue
        const queueStr = await AsyncStorage.getItem('location_queue');
        let queue = queueStr ? JSON.parse(queueStr) : [];
        queue.push({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy,
          timestamp: accurateTimestamp,
        });
        await AsyncStorage.setItem('location_queue', JSON.stringify(queue));

        // 3. Attempt Sync
        await syncLocationQueue();

        // 4. Check Lockout condition
        const lastSyncStr = await AsyncStorage.getItem('last_successful_sync');
        const lastSync = lastSyncStr ? parseInt(lastSyncStr, 10) : Date.now();
        if (Date.now() - lastSync > 10 * 60 * 1000) {
          // Locked out
          await AsyncStorage.setItem('is_locked_out', 'true');
          // Report lockout if possible
          try {
            await fetch(`${TARGET_URL}/api/trpc/alerts.reportLockout`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ json: null })
            });
          } catch (e) { /* ignore */ }
        }
      } catch (err) {
        console.error('Background location error:', err);
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
  const [isLockedOut, setIsLockedOut] = useState(false);

  useEffect(() => {
    const checkLockout = async () => {
      const locked = await AsyncStorage.getItem('is_locked_out');
      setIsLockedOut(locked === 'true');
    };
    const interval = setInterval(checkLockout, 5000);
    return () => clearInterval(interval);
  }, []);

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

        // Sync Time Offset & Initialize sync timer
        try {
          const res = await fetch(`${TARGET_URL}/api/trpc/location.getServerTime`, {
             method: 'GET',
             credentials: 'include',
          });
          if (res.ok) {
            const data = await res.json();
            const serverTime = data?.result?.data?.serverTime;
            if (serverTime) {
              const offset = serverTime - Date.now();
              await AsyncStorage.setItem('time_offset', offset.toString());
            }
          }
          await AsyncStorage.setItem('last_successful_sync', Date.now().toString());
          await AsyncStorage.setItem('is_locked_out', 'false');
        } catch (e) { 
          console.warn("Failed to sync time, using local clock:", e); 
        }

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
          const offsetStr = await AsyncStorage.getItem('time_offset');
          const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
          fetch(`${TARGET_URL}/api/trpc/location.logBreadcrumbBatch`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              json: {
                locations: [{
                  latitude: currentLoc.coords.latitude,
                  longitude: currentLoc.coords.longitude,
                  accuracy: currentLoc.coords.accuracy,
                  timestamp: Date.now() + offset,
                }]
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
      {isLockedOut && (
        <View style={styles.lockoutOverlay}>
          <Text style={styles.lockoutTitle}>App Locked</Text>
          <Text style={styles.lockoutText}>
            Location tracking failed for over 10 minutes. Please restore network/GPS connectivity.
          </Text>
          <TouchableOpacity 
             style={styles.retryButton} 
             onPress={() => syncLocationQueue()}
          >
             <Text style={styles.retryText}>Retry Sync</Text>
          </TouchableOpacity>
        </View>
      )}
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
  lockoutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(220, 38, 38, 0.95)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  lockoutTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  lockoutText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#dc2626',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
