import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthContextProvider } from './context/AuthContext.jsx.jsx'
import { RouterProvider } from 'react-router'
import { router } from './Navigation/router.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContextProvider>
      <RouterProvider router={router}/>
    </AuthContextProvider>
  </StrictMode>,
)
