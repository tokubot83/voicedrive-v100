import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import { DemoModeProvider, DemoModeController } from './components/demo/DemoModeController';
import { TabProvider } from './components/tabs/TabContext';

function App() {
  return (
    <BrowserRouter>
      <DemoModeProvider>
        <TabProvider>
          <DemoModeController />
          <AppRouter />
        </TabProvider>
      </DemoModeProvider>
    </BrowserRouter>
  );
}

export default App;