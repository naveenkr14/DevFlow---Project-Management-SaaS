import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getWorkspaceDashboard } from "../dashboard/dashboard.api";
import type {
  DashboardData,
} from "../dashboard/dashboard.types";
import { useWorkspace } from "../workspaces/workspace.context";

const DashboardPage = () => {
  const {
    workspace,
    isWorkspaceLoading,
  } = useWorkspace();

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!workspace?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data =
          await getWorkspaceDashboard(
            workspace.id,
          );

        setDashboard(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Unable to load dashboard.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, [workspace?.id]);

  if (isWorkspaceLoading || isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
        <h2 className="text-lg font-semibold text-yellow-900">
          No workspace selected
        </h2>

        <p className="mt-2 text-sm text-yellow-800">
          Create or select a workspace before viewing
          the dashboard.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-900">
          Unable to load dashboard
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const {
    overview,
    issues,
    recentActivities,
  } = dashboard;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <p className="text-sm font-medium text-gray-500">
          Workspace
        </p>

        <h2 className="mt-1 text-3xl font-bold text-gray-900">
          {workspace.name}
        </h2>

        <p className="mt-2 text-gray-600">
          Here's what's happening in your workspace.
        </p>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Quick Actions
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Quickly access the areas you use most.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/app/projects"
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow"
          >
            <p className="font-semibold text-gray-900">
              View Projects
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Manage your workspace projects.
            </p>
          </Link>

          <Link
            to="/app/projects/new"
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow"
          >
            <p className="font-semibold text-gray-900">
              Create Project
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Start a new project in this workspace.
            </p>
          </Link>

          <Link
            to="/app/search"
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow"
          >
            <p className="font-semibold text-gray-900">
              Search Workspace
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Find projects and issues quickly.
            </p>
          </Link>

          <Link
            to="/app/activity"
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow"
          >
            <p className="font-semibold text-gray-900">
              View Activity
            </p>

            <p className="mt-1 text-sm text-gray-500">
              See recent workspace activity.
            </p>
          </Link>
        </div>
      </section>

      {/* Overview */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Overview
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Projects
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {overview.totalProjects}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Active Projects
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {overview.activeProjects}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Issues
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {overview.totalIssues}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Team Members
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {overview.totalMembers}
            </p>
          </div>
        </div>
      </section>

      {/* Issue Statistics */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Issue Statistics
        </h3>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Status */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h4 className="font-semibold text-gray-900">
              By Status
            </h4>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  To Do
                </span>

                <span className="font-semibold text-gray-900">
                  {issues.byStatus.TODO}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  In Progress
                </span>

                <span className="font-semibold text-gray-900">
                  {issues.byStatus.IN_PROGRESS}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  In Review
                </span>

                <span className="font-semibold text-gray-900">
                  {issues.byStatus.IN_REVIEW}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Done
                </span>

                <span className="font-semibold text-gray-900">
                  {issues.byStatus.DONE}
                </span>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h4 className="font-semibold text-gray-900">
              By Priority
            </h4>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Low
                </span>

                <span className="font-semibold text-gray-900">
                  {issues.byPriority.LOW}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Medium
                </span>

                <span className="font-semibold text-gray-900">
                  {issues.byPriority.MEDIUM}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  High
                </span>

                <span className="font-semibold text-gray-900">
                  {issues.byPriority.HIGH}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Urgent
                </span>

                <span className="font-semibold text-gray-900">
                  {issues.byPriority.URGENT}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Latest activity from your workspace.
            </p>
          </div>

          <Link
            to="/app/activity"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            View all
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-medium text-gray-900">
                No recent activity
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Activity will appear here as your team
                works in DevFlow.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentActivities.map(
                (activity) => (
                  <div
                    key={activity.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {activity.action}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {activity.entityType}
                          {activity.user?.name
                            ? ` • ${activity.user.name}`
                            : ""}
                        </p>
                      </div>

                      <time
                        className="shrink-0 text-xs text-gray-400"
                        dateTime={
                          activity.createdAt
                        }
                      >
                        {new Date(
                          activity.createdAt,
                        ).toLocaleString()}
                      </time>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;