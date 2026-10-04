import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/auth.context";
import { useWorkspace } from "../workspaces/workspace.context";

const AppLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { workspace } = useWorkspace();

  const workspaceBasePath = workspace
    ? `/app/workspaces/${encodeURIComponent(workspace.slug)}`
    : "/app/create-workspace";

  const handleLogout = async () => {
    await logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              DevFlow
            </h1>

            {workspace && (
              <p className="text-xs text-gray-500">
                {workspace.name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.name}
                </p>

                <p className="text-xs text-gray-500">
                  {user.email}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                void handleLogout();
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="w-64 border-r border-gray-200 bg-white p-4">
          <nav className="space-y-2">
            <NavLink
              to={`${workspaceBasePath}/dashboard`}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to={`${workspaceBasePath}/projects`}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              Projects
            </NavLink>

            <NavLink
              to={`${workspaceBasePath}/activity`}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              Activity
            </NavLink>

            <NavLink
              to={`${workspaceBasePath}/search`}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              Search
            </NavLink>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
