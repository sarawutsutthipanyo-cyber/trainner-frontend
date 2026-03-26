import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import TrainerDashboard from './pages/trainer/TrainerDashboard';
import NewClient from './pages/trainer/NewClient';
import ClientDetail from './pages/trainer/ClientDetail';
import ProgramBuilder from './pages/trainer/ProgramBuilder';
import MealPlanBuilder from './pages/trainer/MealPlanBuilder';
import WorkoutLog from './pages/trainer/WorkoutLog';
import FoodLog from './pages/trainer/FoodLog';
import ProgressLog from './pages/trainer/ProgressLog';
import CardioLog from './pages/trainer/CardioLog';

import ClientDashboard from './pages/client/ClientDashboard';
import FoodPhotoUpload from './pages/client/FoodPhotoUpload';
import MyMealPlan from './pages/client/MyMealPlan';
import TodayWorkout from './pages/client/TodayWorkout';
import FoodLogger from './pages/client/FoodLogger';
import ProgressTracker from './pages/client/ProgressTracker';
import CardioLogger from './pages/client/CardioLogger';
import FoodAnalyzer from './pages/client/FoodAnalyzer';

function RequireTrainer({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'trainer') return <Navigate to="/client/dashboard" replace />;
  return children;
}

function RequireClient({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'user') return <Navigate to="/trainer/dashboard" replace />;
  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'user' ? <Navigate to="/client/dashboard" replace /> : <Navigate to="/trainer/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Trainer routes */}
        <Route path="/trainer/dashboard" element={<RequireTrainer><TrainerDashboard /></RequireTrainer>} />
        <Route path="/trainer/clients/new" element={<RequireTrainer><NewClient /></RequireTrainer>} />
        <Route path="/trainer/clients/:id" element={<RequireTrainer><ClientDetail /></RequireTrainer>} />
        <Route path="/trainer/clients/:id/program" element={<RequireTrainer><ProgramBuilder /></RequireTrainer>} />
        <Route path="/trainer/clients/:id/meal-plan" element={<RequireTrainer><MealPlanBuilder /></RequireTrainer>} />
        <Route path="/trainer/clients/:id/workout-log" element={<RequireTrainer><WorkoutLog /></RequireTrainer>} />
        <Route path="/trainer/clients/:id/food-log" element={<RequireTrainer><FoodLog /></RequireTrainer>} />
        <Route path="/trainer/clients/:id/progress" element={<RequireTrainer><ProgressLog /></RequireTrainer>} />
        <Route path="/trainer/clients/:id/cardio-log" element={<RequireTrainer><CardioLog /></RequireTrainer>} />

        {/* Client routes */}
        <Route path="/client/dashboard" element={<RequireClient><ClientDashboard /></RequireClient>} />
        <Route path="/client/workout" element={<RequireClient><TodayWorkout /></RequireClient>} />
        <Route path="/client/food" element={<RequireClient><FoodLogger /></RequireClient>} />
        <Route path="/client/meal-plan" element={<RequireClient><MyMealPlan /></RequireClient>} />
        <Route path="/client/progress" element={<RequireClient><ProgressTracker /></RequireClient>} />
        <Route path="/client/cardio" element={<RequireClient><CardioLogger /></RequireClient>} />
        <Route path="/client/food-photo" element={<RequireClient><FoodPhotoUpload /></RequireClient>} />
        <Route path="/client/food-analyzer" element={<RequireClient><FoodAnalyzer /></RequireClient>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
