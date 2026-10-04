import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import { getProjectIssues } from "../issues/issue.api";

import type {
  Issue,
} from "../issues/issue.types";

const ProjectIssuesPage = () => {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const [issues, setIssues] =
    useState<Issue[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadIssues = async () => {
      if (!projectId) {
        setError("Project ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data =
          await getProjectIssues(projectId);

        setIssues(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Unable to load issues.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadIssues();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">
          Loading issues...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <Link
          to={
            projectId
              ? `/app/projects/${projectId}`
              : "/app/projects"
          }
          className="text-sm font-medium text-red-700 hover:underline"
        >
          ← Back to project
        </Link>

        <h2 className="mt-6 text-lg font-semibold text-red-900">
          Unable to load issues
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-900">
          Project ID is missing
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            to={`/app/projects/${projectId}`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to project
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Issues
          </h1>

          <p className="mt-2 text-gray-600">
            Track bugs, tasks, features, and
            engineering work for this project.
          </p>
        </div>

        <Link
          to={`/app/projects/${projectId}/issues/new`}
          className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-800"
        >
          + New Issue
        </Link>
      </section>

      {issues.length === 0 ? (
        <section className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto max-w-md">
            <h2 className="text-xl font-semibold text-gray-900">
              No issues yet
            </h2>

            <p className="mt-2 text-gray-600">
              Create the first issue to start
              tracking work for this project.
            </p>

            <Link
              to={`/app/projects/${projectId}/issues/new`}
              className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              Create first issue
            </Link>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <p className="text-sm font-medium text-gray-600">
              {issues.length}{" "}
              {issues.length === 1
                ? "issue"
                : "issues"}
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {issues.map((issue) => (
              <Link
                key={issue.id}
                to={`/app/issues/${issue.id}`}
                className="block px-6 py-5 transition hover:bg-gray-50"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-bold tracking-wide text-gray-500">
                        {issue.key}
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {issue.status}
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {issue.priority}
                      </span>
                    </div>

                    <h2 className="mt-2 text-lg font-semibold text-gray-900">
                      {issue.title}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {issue.description ||
                        "No description."}
                    </p>
                  </div>

                  <div className="shrink-0 text-sm text-gray-500">
                    {issue.assignee
                      ? `Assigned to ${issue.assignee.name}`
                      : "Unassigned"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProjectIssuesPage;