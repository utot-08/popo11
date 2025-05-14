import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import LoginForm from './pages/LoginForm';
import PoliceDashboard from './pages/Dashboard';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './components/Unauthorized';
import Patrols from './components/Patrols'; // Import the Patrols component

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Police Routes */}
          {/* <Route element={<PrivateRoute allowedRoles={['police_officer', 'administrator']} />}>
            <Route path="/" element={<PoliceDashboard />}>
              {/* Nested patrols route under dashboard */}
              {/* <Route path="/patrols" element={<Patrols />} /> */} 
            {/* </Route>
          </Route> */}

          {/* Admin-only Routes */}
          <Route element={<PrivateRoute allowedRoles={['administrator']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Client Routes */}
          <Route element={<PrivateRoute allowedRoles={['client']} />}>
            <Route path="/client" element={<ClientDashboard />} />
          </Route>

          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;