import React from 'react';
import { PermissionsAndroid, Platform, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import i18n, { initI18n } from './i18n';

import TabNavigator from './navigation/TabNavigator';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { store } from './redux/store';
import { bootstrapAndSyncShipments } from './redux/shipmentsSlice';
import { loadSettings } from './redux/settingsSlice';

enableScreens();
initI18n();

function AppBootstrap() {
  const dispatch = useAppDispatch();
  const language = useAppSelector(s => s.settings.language);

  React.useEffect(() => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS').catch(
        () => {},
      );
    }

    dispatch(loadSettings());
    dispatch(bootstrapAndSyncShipments());
  }, [dispatch]);

  React.useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <NavigationContainer>
            <View style={styles.container}>
              <TabNavigator />
            </View>
          </NavigationContainer>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppBootstrap />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
