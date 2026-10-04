import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import {
  createLabel,
  deleteLabel,
  getProjectLabels,
  updateLabel,
} from "../labels/label.api";

import type {
  Label,
} from "../labels/label.types";

const DEFAULT_LABEL_COLOR = "#3B82F6";

const ProjectLabelsPage = () => {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const [labels, setLabels] =
    useState<Label[]>([]);

  const [name, setName] = useState("");
  const [color, setColor] =
    useState(DEFAULT_LABEL_COLOR);

  const [editingLabelId, setEditingLabelId] =
    useState<string | null>(null);

  const [editingName, setEditingName] =
    useState("");

  const [editingColor, setEditingColor] =
    useState(DEFAULT_LABEL_COLOR);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [deletingLabelId, setDeletingLabelId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const loadLabels = async () => {
    if (!projectId) {
      setError("Project ID is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data =
        await getProjectLabels(projectId);

      setLabels(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to load labels.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLabels();
  }, [projectId]);

  const handleCreateLabel = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!projectId) {
      setError("Project ID is missing.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newLabel =
        await createLabel(
          projectId,
          {
            name: name.trim(),
            color: color.toUpperCase(),
          },
        );

      setLabels((currentLabels) => [
        ...currentLabels,
        newLabel,
      ]);

      setName("");
      setColor(DEFAULT_LABEL_COLOR);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to create label.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditingLabel = (
    label: Label,
  ) => {
    setEditingLabelId(label.id);
    setEditingName(label.name);
    setEditingColor(label.color);
    setError(null);
  };

  const cancelEditingLabel = () => {
    setEditingLabelId(null);
    setEditingName("");
    setEditingColor(
      DEFAULT_LABEL_COLOR,
    );
  };

  const handleUpdateLabel = async (
    labelId: string,
  ) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedLabel =
        await updateLabel(
          labelId,
          {
            name: editingName.trim(),
            color:
              editingColor.toUpperCase(),
          },
        );

      setLabels((currentLabels) =>
        currentLabels.map((label) =>
          label.id === labelId
            ? updatedLabel
            : label,
        ),
      );

      cancelEditingLabel();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to update label.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLabel = async (
    labelId: string,
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this label?",
      );

    if (!confirmed) {
      return;
    }

    setDeletingLabelId(labelId);
    setError(null);

    try {
      await deleteLabel(labelId);

      setLabels((currentLabels) =>
        currentLabels.filter(
          (label) =>
            label.id !== labelId,
        ),
      );

      if (editingLabelId === labelId) {
        cancelEditingLabel();
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to delete label.",
        );
      }
    } finally {
      setDeletingLabelId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">
          Loading labels...
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

        <Link
          to="/app/projects"
          className="mt-4 inline-block text-sm font-medium text-red-700 hover:underline"
        >
          ← Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          to={`/app/projects/${projectId}`}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to project
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Project Labels
        </h1>

        <p className="mt-2 text-gray-600">
          Create and manage labels used to
          organize project issues.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Create label
        </h2>

        <form
          onSubmit={handleCreateLabel}
          className="mt-5 grid gap-5 md:grid-cols-[1fr_180px_auto] md:items-end"
        >
          <div>
            <label
              htmlFor="label-name"
              className="block text-sm font-semibold text-gray-800"
            >
              Name
            </label>

            <input
              id="label-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="bug"
              required
              minLength={1}
              maxLength={50}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="label-color"
              className="block text-sm font-semibold text-gray-800"
            >
              Color
            </label>

            <div className="mt-2 flex gap-2">
              <input
                id="label-color"
                type="color"
                value={color}
                onChange={(event) =>
                  setColor(
                    event.target.value.toUpperCase(),
                  )
                }
                className="h-12 w-14 cursor-pointer rounded-lg border border-gray-300 bg-white p-1"
              />

              <input
                type="text"
                value={color}
                onChange={(event) =>
                  setColor(
                    event.target.value.toUpperCase(),
                  )
                }
                pattern="^#[0-9A-Fa-f]{6}$"
                maxLength={7}
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Creating..."
              : "Create label"}
          </button>
        </form>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Labels
          </h2>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {labels.length}
          </span>
        </div>

        {labels.length === 0 ? (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              No labels yet
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Create your first label to
              organize project issues.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {labels.map((label) => (
              <article
                key={label.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                {editingLabelId ===
                label.id ? (
                  <div className="grid gap-5 md:grid-cols-[1fr_220px_auto] md:items-end">
                    <div>
                      <label
                        htmlFor={`edit-label-name-${label.id}`}
                        className="block text-sm font-semibold text-gray-800"
                      >
                        Name
                      </label>

                      <input
                        id={`edit-label-name-${label.id}`}
                        type="text"
                        value={editingName}
                        onChange={(event) =>
                          setEditingName(
                            event.target.value,
                          )
                        }
                        minLength={1}
                        maxLength={50}
                        className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`edit-label-color-${label.id}`}
                        className="block text-sm font-semibold text-gray-800"
                      >
                        Color
                      </label>

                      <div className="mt-2 flex gap-2">
                        <input
                          id={`edit-label-color-${label.id}`}
                          type="color"
                          value={editingColor}
                          onChange={(event) =>
                            setEditingColor(
                              event.target.value.toUpperCase(),
                            )
                          }
                          className="h-12 w-14 cursor-pointer rounded-lg border border-gray-300 bg-white p-1"
                        />

                        <input
                          type="text"
                          value={editingColor}
                          onChange={(event) =>
                            setEditingColor(
                              event.target.value.toUpperCase(),
                            )
                          }
                          pattern="^#[0-9A-Fa-f]{6}$"
                          maxLength={7}
                          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() =>
                          void handleUpdateLabel(
                            label.id,
                          )
                        }
                        className="rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting
                          ? "Saving..."
                          : "Save"}
                      </button>

                      <button
                        type="button"
                        onClick={
                          cancelEditingLabel
                        }
                        className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <span
                        className="h-5 w-5 rounded-full border border-gray-200"
                        style={{
                          backgroundColor:
                            label.color,
                        }}
                        aria-hidden="true"
                      />

                      <div>
                        <p className="font-semibold text-gray-900">
                          {label.name}
                        </p>

                        <p className="mt-1 font-mono text-xs text-gray-500">
                          {label.color}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          startEditingLabel(
                            label,
                          )
                        }
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={
                          deletingLabelId ===
                          label.id
                        }
                        onClick={() =>
                          void handleDeleteLabel(
                            label.id,
                          )
                        }
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingLabelId ===
                        label.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProjectLabelsPage;