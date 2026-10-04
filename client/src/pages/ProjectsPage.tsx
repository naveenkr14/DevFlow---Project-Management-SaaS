import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useWorkspace } from "../workspaces/workspace.context";
import { getWorkspaceProjects } from "../projects/project.api";

import type {
  Project,
} from "../projects/project.types";

const ProjectsPage = () => {
  const {
    workspace,
    isWorkspaceLoading,
  } = useWorkspace();

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      if (!workspace?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data =
          await getWorkspaceProjects(
            workspace.id,
          );

        setProjects(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Unable to load projects.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadProjects();
  }, [workspace?.id]);

  if (isWorkspaceLoading || isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">
          Loading projects...
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
          Select a workspace before viewing
          projects.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-900">
          Unable to load projects
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Workspace
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Projects
          </h1>

          <p className="mt-2 text-gray-600">
            Manage the software projects in{" "}
            {workspace.name}.
          </p>
        </div>

        <Link
          to="/app/projects/new"
          className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-800"
        >
          + New Project
        </Link>
      </section>

      {projects.length === 0 ? (
        <section className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto max-w-md">
            <h2 className="text-xl font-semibold text-gray-900">
              No projects yet
            </h2>

            <p className="mt-2 text-gray-600">
              Create your first project to start
              managing issues and development work.
            </p>

            <Link
              to="/app/projects/new"
              className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              Create your first project
            </Link>
          </div>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold tracking-wide text-gray-500">
                    {project.key}
                  </p>

                  <h2 className="mt-2 text-xl font-semibold text-gray-900">
                    {project.name}
                  </h2>
                </div>

                <span
                  className={
                    project.status === "ACTIVE"
                      ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                      : "rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                  }
                >
                  {project.status}
                </span>
              </div>

              <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                {project.description ||
                  "No project description."}
              </p>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {project.issueCounter}{" "}
                  {project.issueCounter === 1
                    ? "issue"
                    : "issues"}
                </span>

                <Link
                  to={`/app/projects/${project.id}`}
                  className="text-sm font-semibold text-gray-900 hover:underline"
                >
                  View project →
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default ProjectsPage;