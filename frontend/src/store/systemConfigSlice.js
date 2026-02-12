import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { systemConfigApi } from '../api/systemConfigApi';

export const fetchSystems = createAsyncThunk(
  'systemConfig/fetchSystems',
  async () => systemConfigApi.getAll()
);

export const fetchSystemByKey = createAsyncThunk(
  'systemConfig/fetchSystemByKey',
  async (key) => systemConfigApi.getByKey(key)
);

export const createSystem = createAsyncThunk(
  'systemConfig/createSystem',
  async (data) => systemConfigApi.create(data)
);

export const updateSystem = createAsyncThunk(
  'systemConfig/updateSystem',
  async ({ key, data }) => systemConfigApi.update(key, data)
);

export const deleteSystem = createAsyncThunk(
  'systemConfig/deleteSystem',
  async (key) => {
    await systemConfigApi.delete(key);
    return key;
  }
);

const systemConfigSlice = createSlice({
  name: 'systemConfig',
  initialState: {
    systems: [],
    currentSystem: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentSystem: (state) => {
      state.currentSystem = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystems.fulfilled, (state, action) => {
        state.loading = false;
        state.systems = action.payload;
      })
      .addCase(fetchSystems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchSystemByKey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemByKey.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSystem = action.payload;
      })
      .addCase(fetchSystemByKey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createSystem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSystem.fulfilled, (state, action) => {
        state.loading = false;
        state.systems.push(action.payload);
      })
      .addCase(createSystem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteSystem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSystem.fulfilled, (state, action) => {
        state.loading = false;
        state.systems = state.systems.filter(
          (s) => s.systemKey !== action.payload
        );
      })
      .addCase(deleteSystem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearCurrentSystem, clearError } = systemConfigSlice.actions;
export default systemConfigSlice.reducer;
