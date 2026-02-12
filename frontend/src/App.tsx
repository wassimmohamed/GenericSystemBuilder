import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import AppLayout from './components/layout/AppLayout'

const Dashboard = lazy(() => import('./pages/runtime/Dashboard'))
const DynamicPage = lazy(() => import('./pages/runtime/DynamicPage'))
const SystemList = lazy(() => import('./pages/admin/SystemList'))
const SystemBuilder = lazy(() => import('./pages/admin/SystemBuilder'))

function Loading() {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <Spinner animation="border" />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/systems/:systemKey" element={<DynamicPage />} />
            <Route path="/admin/systems" element={<SystemList />} />
            <Route path="/admin/systems/new" element={<SystemBuilder />} />
            <Route path="/admin/systems/:systemKey" element={<SystemBuilder />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
