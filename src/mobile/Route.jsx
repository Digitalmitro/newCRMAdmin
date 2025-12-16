import { Navigate, Route, Routes } from "react-router-dom";
import MobileLayout from "./layout/MobileLayout";
import Home from "../desktop/pages/Home";
import Attendance from "../desktop/pages/Attendance";
import Chat from "../desktop/pages/Chat";
import NotificationSystem from "../desktop/pages/Notification";
import EmployeesActivity from "../desktop/pages/EmployeesActivity";
import MobileConversations from "./pages/MobileConversations";
import Login from "../desktop/pages/Login";
import ProtectedRoute from "../desktop/ProtectedRoute";

// Mobile routes reuse existing pages; layout provides mobile nav/shell.
function MobileRouting() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MobileLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/conversations" element={<MobileConversations />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/notification" element={<NotificationSystem />} />
        <Route path="/employee" element={<EmployeesActivity />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default MobileRouting;
