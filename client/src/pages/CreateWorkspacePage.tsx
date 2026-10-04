import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useWorkspace } from "../workspaces/workspace.context";

const CreateWorkspacePage = () => {
  const navigate = useNavigate();

  const { createNewWorkspace } = useWorkspace();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      await createNewWorkspace({
        name,
        slug,
      });

      navigate(
        `/app/workspaces/${encodeURIComponent(slug)}/dashboard`,
        { replace: true },
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to create workspace.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create a workspace
          </h1>

          <p className="mt-2 text-gray-600">
            Your workspace is where your team will manage
            projects and issues.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="workspace-name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Workspace name
            </label>

            <input
              id="workspace-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
              minLength={2}
              maxLength={100}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              placeholder="DevFlow Team"
            />
          </div>

          <div>
            <label
              htmlFor="workspace-slug"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Workspace slug
            </label>

            <input
              id="workspace-slug"
              type="text"
              value={slug}
              onChange={(event) =>
                setSlug(event.target.value.toLowerCase())
              }
              required
              minLength={3}
              maxLength={50}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              placeholder="devflow-team"
            />

            <p className="mt-2 text-xs text-gray-500">
              Use lowercase letters, numbers, and hyphens.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Creating workspace..."
              : "Create workspace"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default CreateWorkspacePage;