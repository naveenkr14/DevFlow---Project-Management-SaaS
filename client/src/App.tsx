import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./auth/auth.context";
import { WorkspaceProvider } from "./workspaces/workspace.context";

function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <AppRoutes />
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;
