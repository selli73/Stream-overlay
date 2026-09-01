import { createContext } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AuthStore from './store/AuthStore';

interface State {
  authStore: AuthStore;
}

const authStore = new AuthStore();

export const Context = createContext<State>({
  authStore
});

createRoot(document.getElementById('root')!).render(
  <Context.Provider value={{
      authStore
    }}>
    <App />
  </Context.Provider>
)