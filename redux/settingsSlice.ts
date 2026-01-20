import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AppLanguage = 'en' | 'ar';
export type AppTheme = 'dark' | 'light';

export type SettingsState = {
  language: AppLanguage;
  theme: AppTheme;
  seasonalBannerEnabled: boolean;
};

const STORAGE_KEY = 'fieldagentpro.settings.v1';

const initialState: SettingsState = {
  language: 'en',
  theme: 'dark',
  seasonalBannerEnabled: true,
};

export const loadSettings = createAsyncThunk('settings/load', async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return initialState;

  try {
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    return {
      ...initialState,
      ...parsed,
    } satisfies SettingsState;
  } catch {
    return initialState;
  }
});

export const persistSettings = createAsyncThunk(
  'settings/persist',
  async (settings: SettingsState) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return settings;
  },
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<AppLanguage>) {
      state.language = action.payload;
    },
    setTheme(state, action: PayloadAction<AppTheme>) {
      state.theme = action.payload;
    },
    setSeasonalBannerEnabled(state, action: PayloadAction<boolean>) {
      state.seasonalBannerEnabled = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(loadSettings.fulfilled, (_state, action) => action.payload);
    builder.addCase(
      persistSettings.fulfilled,
      (_state, action) => action.payload,
    );
  },
});

export const { setLanguage, setTheme, setSeasonalBannerEnabled } =
  settingsSlice.actions;

export default settingsSlice.reducer;
