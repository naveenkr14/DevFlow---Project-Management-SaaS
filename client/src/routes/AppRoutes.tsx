import {
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";

import ProtectedRoute from "../auth/ProtectedRoute";
import AppLayout from "../layouts/AppLayout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import CreateWorkspacePage from "../pages/CreateWorkspacePage";
import DashboardPage from "../pages/DashboardPage";
import ProjectsPage from "../pages/ProjectsPage";
import CreateProjectPage from "../pages/CreateProjectPage";
import ProjectDetailsPage from "../pages/ProjectDetailsPage";
import ProjectIssuesPage from "../pages/ProjectIssuesPage";
import CreateIssuePage from "../pages/CreateIssuePage";
import IssueDetailsPage from "../pages/IssueDetailsPage";
import EditIssuePage from "../pages/EditIssuePage";
import ProjectLabelsPage from "../pages/ProjectLabelsPage";
import ProjectBoardPage from "../pages/ProjectBoardPage";
import ActivityPage from "../pages/ActivityPage";
import SearchPage from "../pages/SearchPage";

import {
  useWorkspace,
} from "../workspaces/workspace.context";

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-900">
        404 - Page Not Found
      </h1>
    </main>
  );
}

type LegacyWorkspaceRedirectProps = {
  buildPath: (
    workspaceSlug: string,
    params: Record<string, string | undefined>,
  ) => string;
};

function LegacyWorkspaceRedirect({
  buildPath,
}: LegacyWorkspaceRedirectProps) {
  const params = useParams();
  const { workspace, isWorkspaceLoading } =
    useWorkspace();

  if (isWorkspaceLoading) {
    return (
      <main className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">
          Loading workspace...
        </p>
      </main>
    );
  }

  if (!workspace) {
    return (
      <Navigate
        to="/app/create-workspace"
        replace
      />
    );
  }

  return (
    <Navigate
      to={buildPath(workspace.slug, params)}
      replace
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/app/create-workspace"
          element={<CreateWorkspacePage />}
        />

        <Route
          path="/app/workspaces/:workspaceSlug"
          element={<AppLayout />}
        >
          <Route
            index
            element={
              <Navigate
                to="dashboard"
                replace
              />
            }
          />

          <Route
            path="dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="projects"
            element={<ProjectsPage />}
          />

          <Route
            path="projects/new"
            element={<CreateProjectPage />}
          />

          <Route
            path="projects/:projectId"
            element={<ProjectDetailsPage />}
          />

          <Route
            path="projects/:projectId/issues"
            element={<ProjectIssuesPage />}
          />

          <Route
            path="projects/:projectId/issues/new"
            element={<CreateIssuePage />}
          />

          <Route
            path="projects/:projectId/board"
            element={<ProjectBoardPage />}
          />

          <Route
            path="projects/:projectId/labels"
            element={<ProjectLabelsPage />}
          />

          <Route
            path="issues/:issueId"
            element={<IssueDetailsPage />}
          />

          <Route
            path="issues/:issueId/edit"
            element={<EditIssuePage />}
          />

          <Route
            path="activity"
            element={<ActivityPage />}
          />

          <Route
            path="search"
            element={<SearchPage />}
          />
        </Route>

        <Route element={<AppLayout />}>
          <Route
            path="/app"
            element={
              <LegacyWorkspaceRedirect
                buildPath={(slug) =>
                  `/app/workspaces/${encodeURIComponent(slug)}/dashboard`
                }
              />
            }
          />

          <Route
            path="/app/dashboard"
            element={
              <LegacyWorkspaceRedirect
                buildPath={(slug) =>
                  `/app/workspaces/${encodeURIComponent(slug)}/dashboard`
                }
              />
            }
          />

          <Route
            path="/app/projects"
            element={
              <LegacyWorkspaceRedirect
                buildPath={(slug) =>
                  `/app/workspaces/${encodeURIComponent(slug)}/projects`
                }
              />
            }
          />

          <Route
            path="/app/projects/new"
            element={
              <LegacyWorkspaceRedirect
                buildPath={(slug) =>
                  `/app/workspaces/${encodeURIComponent(slug)}/projects/new`
                }
              />
            }
          />

          <Route
            path="/app/projects/:projectId"
            element={
              <LegacyWorkspaceRedirect
                buildPath={(slug, params) =>
                  `/app/workspaces/${encodeURIComponent(slug)}/projects/${params.projectId}`
                }
              />
            }
          />

          <Route
            path="/app/projects/:projectId/issues"
            element={
              <LegacyWorkspaceRedirect
                buildPath={(slug, params) =>
                  `/app/workspaces/${encodeURIComponent(slug)}/projects/${params.projectId}/issues`
                }
              />
            }
          />

          <Route
            path="/app/projects/:projectId/issues/new"
            element={
              <LegacyWorkspaceRedirect
                buildPath={(slug, params) =>
                  `/app/workspaces/${encodeURIComponent(slug)}/projects/${params.projectId}/issues/new`
                }
              />
            }
          />

          <Route
            path="/app/projects/:projectId/board"
            element={
              <LegacyWorkspaceRedirect
                buildPath={(slug, params) =>
                  `/app/workspaces/${encodeURIComponent(slug)}/projects/${params.projectId}/board`
                }
              />
            }
          />

          <Route
            path="/app/projects/:projectId/labels"
            element={
              <LegacyWorkspaceRedirect
                buildPath={(slug, params) =>
                  `/app/workspaces/${encodeURIComponent(slug)}/projects/${params.projectId}/labels`
                }
              />
            }
          />

          <Route
            path="/app/issues/:issueId"
            element={
              <LegacyWorkspaceRedirect
                buildPath={(slug, params) =>
                  `/app/workspaces/${encodeURIComponent(slug)}/issues/${params.issueId}`
                }
              />
            }
          />

          <Route
            path="/app/issues/:issueId/edit"
            element={
              <LegacyWorkspaceRedirect
                buildPath={(slug, params) =>
                  `/app/workspaces/${encodeURIComponent(slug)}/issues/${params.issueId}/edit`
                }
              />
            }
          />

          <Route
            path="/app/activity"
            element={
              <LegacyWorkspaceRedirect
                buildPath={(slug) =>
                  `/app/workspaces/${encodeURIComponent(slug)}/activity`
                }
              />
            }
          />

          <Route
            path="/app/search"
            element={
              <LegacyWorkspaceRedirect
                buildPath={(slug) =>
                  `/app/workspaces/${encodeURIComponent(slug)}/search`
                }
              />
            }
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}

export default AppRoutes;
