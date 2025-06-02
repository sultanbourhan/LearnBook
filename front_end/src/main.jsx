import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// ✅ استيراد الترجمة
import './i18n.js'; // مهم جداً لتهيئة i18next قبل عرض التطبيق

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)
