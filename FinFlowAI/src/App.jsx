import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import BottomTab from './components/BottomTab';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgeting from './pages/Budgeting';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import ToastContainer from './components/ToastContainer';
import FinancialCoach from './components/FinancialCoach';
import OnboardingModal from './components/OnboardingModal';

function ProtectedRoute({ children }) {
  const { user } = useAppContext();
  
  if (!user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AppLayout() {
  const { user } = useAppContext();

  return (
    <div className="flex h-screen w-full relative">
      {/* Background layer */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0"></div>
      
      {/* Router Guarded Content */}
      <Routes>
        <Route path="/login" element={<Auth />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            {/* Show Onboarding Modals if needed */}
            {!user.hasCompletedOnboarding && <OnboardingModal />}

            <div className="flex w-full h-full relative z-10">
              {/* Sidebar for Desktop */}
              <div className="hidden md:flex z-10 w-64 p-4">
                <Sidebar />
              </div>

              {/* Main Content Area */}
              <main className="flex-1 w-full h-full p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto z-10 relative">
                <div className="max-w-6xl mx-auto h-full">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/budgeting" element={<Budgeting />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </main>

              {/* Bottom Tab for Mobile */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4">
                <BottomTab />
              </div>
            </div>
            
            <ToastContainer />
            <FinancialCoach />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  );
}
