import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import fundsReducer from '../features/funds/fundsSlice';
import investmentsReducer from '../features/investments/investmentsSlice';
import investorsReducer from '../features/investors/investorsSlice';
import capitalCallsReducer from '../features/investors/capitalCallsSlice';
import distributionsReducer from '../features/investors/distributionsSlice';
import transactionsReducer from '../features/transactions/transactionsSlice';
import valuationsReducer from '../features/valuations/valuationsSlice';
import reportsReducer from '../features/reports/reportsSlice';
import documentsReducer from '../features/documents/documentsSlice';
import eventsReducer from '../features/events/eventsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    funds: fundsReducer,
    investments: investmentsReducer,
    investors: investorsReducer,
    capitalCalls: capitalCallsReducer,
    distributions: distributionsReducer,
    transactions: transactionsReducer,
    valuations: valuationsReducer,
    reports: reportsReducer,
    documents: documentsReducer,
    events: eventsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
