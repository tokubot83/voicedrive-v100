import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import { DemoModeProvider, DemoModeController } from './components/demo/DemoModeController';

function App() {
  return (
    <BrowserRouter>
      <DemoModeProvider>
        <DemoModeController />
        <AppRouter />
      </DemoModeProvider>
    </BrowserRouter>
  );
}

export default App;