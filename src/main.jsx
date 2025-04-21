import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import GlobalState from './component/GlobalStore/GlobalState';

createRoot(document.getElementById('root')).render(
  <GlobalState>
    <App />
  </GlobalState>
);