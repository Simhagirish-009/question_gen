import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ContextPage from "./pages/ContextPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./layouts/ProtectedLayout"; // ⬅️ import layout
import QuestionsPage from "./pages/QuestionsPaper";
import Welcome from "./pages/Welcome";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/context" element={<ContextPage />} />
            <Route path="/question"element={<QuestionsPage/>}/>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
