import {
  useState,
  type FormEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import { useWorkspace } from "../workspaces/workspace.context";
import { createProject } from "../projects/project.api";

const CreateProjectPage = () => {
  const navigate = useNavigate();

  const {
    workspace,
    isWorkspaceLoading,
  } = useWorkspace();

  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!workspace) {
      setError("No workspace selected.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createProject(
        workspace.id,
        {
          name: name.trim(),
          key: key.trim().toUpperCase(),
          description:
            description.trim() || undefined,
        },
      );

      navigate("/app/projects");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to create project.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isWorkspaceLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">
          Loading workspace...
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
          Select a workspace before creating a
          project.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link
          to="/app/projects"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to projects
        </Link>

        <p className="mt-6 text-sm font-medium text-gray-500">
          Workspace
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Create a project
        </h1>

        <p className="mt-2 text-gray-600">
          Create a new software project in{" "}
          {workspace.name}.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label
              htmlFor="project-name"
              className="block text-sm font-semibold text-gray-800"
            >
              Project name
            </label>

            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="DevFlow Platform"
              required
              minLength={2}
              maxLength={100}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />

            <p className="mt-2 text-sm text-gray-500">
              A clear name that identifies your
              project.
            </p>
          </div>

          <div>
            <label
              htmlFor="project-key"
              className="block text-sm font-semibold text-gray-800"
            >
              Project key
            </label>

            <input
              id="project-key"
              type="text"
              value={key}
              onChange={(event) =>
                setKey(
                  event.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, ""),
                )
              }
              placeholder="DF"
              required
              minLength={2}
              maxLength={10}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 uppercase text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />

            <p className="mt-2 text-sm text-gray-500">
              2–10 uppercase letters or numbers.
              This will identify issues, such as
              DF-1.
            </p>
          </div>

          <div>
            <label
              htmlFor="project-description"
              className="block text-sm font-semibold text-gray-800"
            >
              Description
            </label>

            <textarea
              id="project-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe what this project is about..."
              maxLength={500}
              rows={5}
              className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />

            <p className="mt-2 text-sm text-gray-500">
              Optional. Maximum 500 characters.
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
          <Link
            to="/app/projects"
            className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Creating..."
              : "Create project"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectPage;