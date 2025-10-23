import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import fundsReducer from '../features/funds/fundsSlice';
import investmentsReducer from '../features/investments/investmentsSlice';
import investorsReducer from '../features/investors/investorsSlice';
import capitalCallsReducer from '../features/investors/capitalCallsSlice';
import valuationsReducer from '../features/valuations/valuationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    funds: fundsReducer,
    investments: investmentsReducer,
    investors: investorsReducer,
    capitalCalls: capitalCallsReducer,
    valuations: valuationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
