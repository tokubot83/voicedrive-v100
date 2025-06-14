import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import { DemoModeProvider, DemoModeController } from './components/demo/DemoModeController';
import { TabProvider } from './components/tabs/TabContext';
import ReactDebugger from './components/ReactDebugger';

function App() {
  return (
    <BrowserRouter>
      <DemoModeProvider>
        <TabProvider>
          <ReactDebugger />
          <DemoModeController />
          <AppRouter />
        </TabProvider>
      </DemoModeProvider>
    </BrowserRouter>
  );
}

export default App;