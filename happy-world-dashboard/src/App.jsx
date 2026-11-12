
import { ThemeProvider } from './context/ThemeContext';
import { FilterProvider } from './context/FilterContext';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ThemeProvider>
      <FilterProvider>
        <Dashboard />
      </FilterProvider>
    </ThemeProvider>
  );
}

export default App;

