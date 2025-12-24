import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './route.config.tsx'
import { DataProvider } from './context/index.tsx'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById('root')!).render(
  <DataProvider>
    <RouterProvider router={router} />
    <ToastContainer position='top-right' autoClose={3000} />
  </DataProvider>
)
