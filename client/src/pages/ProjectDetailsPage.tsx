import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import { getProject } from "../projects/project.api";

import type {
  ProjectDetails,
} from "../projects/project.types";

const ProjectDetailsPage = () => {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const [project, setProject] =
    useState<ProjectDetails | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setError("Project ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data =
          await getProject(projectId);

        setProject(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Unable to load project.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">
          Loading project...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <Link
          to="/app/projects"
          className="text-sm font-medium text-red-700 hover:underline"
        >
          ← Back to projects
        </Link>

        <h2 className="mt-6 text-lg font-semibold text-red-900">
          Unable to load project
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Project not found
        </h2>

        <Link
          to="/app/projects"
          className="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline"
        >
          ← Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div>
        <Link
          to="/app/projects"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to projects
        </Link>
      </div>

      {/* Project header */}
      <section className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold tracking-wide text-gray-500">
                {project.key}
              </span>

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

            <h1 className="mt-3 text-3xl font-bold text-gray-900">
              {project.name}
            </h1>

            <p className="mt-3 max-w-2xl text-gray-600">
              {project.description ||
                "No project description."}
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Project settings
          </button>
        </div>
      </section>

      {/* Project navigation */}
      <section className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        <nav className="grid gap-2 sm:grid-cols-3">
          <Link
            to={`/app/projects/${project.id}/issues`}
            className="rounded-lg px-4 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
          >
            Issues
          </Link>

          <Link
            to={`/app/projects/${project.id}/board`}
            className="rounded-lg px-4 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
          >
            Board
          </Link>

          <Link
            to={`/app/projects/${project.id}/labels`}
            className="rounded-lg px-4 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
          >
            Labels
          </Link>
        </nav>
      </section>

      {/* Project statistics */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900">
          Overview
        </h2>

        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Issues
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {project.issueCounter}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Project key
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {project.key}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Status
            </p>

            <p className="mt-3 text-xl font-bold text-gray-900">
              {project.status}
            </p>
          </div>
        </div>
      </section>

      {/* Project workspace */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900">
          Workspace
        </h2>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            This project belongs to
          </p>

          <p className="mt-2 text-lg font-semibold text-gray-900">
            {project.workspace.name}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {project.workspace.slug}
          </p>
        </div>
      </section>

      {/* Project modules */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900">
          Project workspace
        </h2>

        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <Link
            to={`/app/projects/${project.id}/issues`}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Issues
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Track bugs, tasks, features, and
              engineering work for this project.
            </p>

            <span className="mt-4 inline-block text-sm font-semibold text-gray-900">
              Open issues →
            </span>
          </Link>

          <Link
            to={`/app/projects/${project.id}/board`}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Kanban board
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Visualize issue progress across
              your development workflow.
            </p>

            <span className="mt-4 inline-block text-sm font-semibold text-gray-900">
              Open board →
            </span>
          </Link>

          <Link
            to={`/app/projects/${project.id}/labels`}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Labels
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Organize and categorize project
              issues using labels.
            </p>

            <span className="mt-4 inline-block text-sm font-semibold text-gray-900">
              Manage labels →
            </span>
          </Link>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Activity
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Review important activity and
              changes across this project.
            </p>

            <span className="mt-4 inline-block text-sm font-medium text-gray-400">
              Coming soon
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectDetailsPage;