import { createContext } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AuthStore from './store/AuthStore';
import './index.css'
import { SessionStore } from './store/SessionStore';
import { TrackHistoryStore } from './store/TrackHistoryStore';

interface State {
  authStore: AuthStore;
  sessionStore: SessionStore;
  trackHistoryStore: TrackHistoryStore
}

const authStore = new AuthStore();
const sessionStore = new SessionStore();
const trackHistoryStore = new TrackHistoryStore();

export const Context = createContext<State>({
  authStore,
  sessionStore,
  trackHistoryStore
});

createRoot(document.getElementById('root')!).render(
  <Context.Provider value={{
      authStore,
      sessionStore,
      trackHistoryStore
    }}>
    <App />
  </Context.Provider>
)