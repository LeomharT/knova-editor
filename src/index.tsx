import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import 'antd/dist/reset.css';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './index.css';

const queryClient = new QueryClient({});

const root = ReactDOM.createRoot(document.querySelector('#root') as HTMLDivElement);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools />
    </QueryClientProvider>
  </StrictMode>
);
