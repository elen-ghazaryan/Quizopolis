import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './route.config.tsx'
import { DataProvider } from './context/index.tsx'

createRoot(document.getElementById('root')!).render(
  <DataProvider>
    <RouterProvider router={router} />
  </DataProvider>
)
