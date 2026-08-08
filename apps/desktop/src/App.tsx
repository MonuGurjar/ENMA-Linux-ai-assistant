import { Routes, Route } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { ChatPage } from "./pages/ChatPage";
import { SettingsPage } from "./pages/SettingsPage";
import { FeatureViewPage } from "./pages/FeatureViewPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Default route starts a new chat */}
        <Route path="/" element={<ChatPage />} />
        {/* View an existing chat */}
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* Feature routes */}
        <Route path="/system" element={<FeatureViewPage />} />
        <Route path="/files" element={<FeatureViewPage />} />
        <Route path="/tools" element={<FeatureViewPage />} />
        <Route path="/terminal" element={<FeatureViewPage />} />
        <Route path="/knowledge" element={<FeatureViewPage />} />
        <Route path="/tasks" element={<FeatureViewPage />} />
      </Route>
    </Routes>
  );
}

export default App;
