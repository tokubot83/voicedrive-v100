import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import { DemoModeProvider, DemoModeController } from './components/demo/DemoModeController';
import { TabProvider } from './components/tabs/TabContext';
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DemoModeProvider>
          <TabProvider>
            <DemoModeController />
            <AppRouter />
          </TabProvider>
        </DemoModeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;