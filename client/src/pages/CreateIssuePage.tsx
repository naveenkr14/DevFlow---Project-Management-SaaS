import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { createIssue } from "../issues/issue.api";

import type {
  IssuePriority,
} from "../issues/issue.types";

import {
  getWorkspaceMembers,
  type WorkspaceMember,
} from "../workspaces/workspace.api";

import { useWorkspace } from "../workspaces/workspace.context";

const CreateIssuePage = () => {
  const navigate = useNavigate();

  const { projectId } = useParams<{
    projectId: string;
  }>();

  const {
    workspace,
    isWorkspaceLoading,
  } = useWorkspace();

  const [members, setMembers] =
    useState<WorkspaceMember[]>([]);

  const [isMembersLoading, setIsMembersLoading] =
    useState(true);

  const [title, setTitle] = useState("");

  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState<IssuePriority>("MEDIUM");

  const [assigneeId, setAssigneeId] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      if (!workspace?.id) {
        setIsMembersLoading(false);
        return;
      }

      setIsMembersLoading(true);

      try {
        const data =
          await getWorkspaceMembers(
            workspace.id,
          );

        setMembers(data);
      } catch (error) {
        console.error(
          "Failed to load workspace members:",
          error,
        );

        setError(
          "Unable to load workspace members.",
        );
      } finally {
        setIsMembersLoading(false);
      }
    };

    void loadMembers();
  }, [workspace?.id]);

  const handleSubmit = async (
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
      await createIssue(
        projectId,
        {
          title: title.trim(),
          description:
            description.trim() || undefined,
          priority,
          assigneeId:
            assigneeId || undefined,
        },
      );

      navigate(
        `/app/projects/${projectId}/issues`,
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to create issue.",
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

  if (!workspace) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
        <h2 className="text-lg font-semibold text-yellow-900">
          No workspace selected
        </h2>

        <p className="mt-2 text-sm text-yellow-800">
          Select a workspace before creating
          an issue.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link
          to={`/app/projects/${projectId}/issues`}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to issues
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Create an issue
        </h1>

        <p className="mt-2 text-gray-600">
          Create a bug, task, feature, or other
          piece of engineering work.
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
              htmlFor="issue-title"
              className="block text-sm font-semibold text-gray-800"
            >
              Title
            </label>

            <input
              id="issue-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Fix authentication error"
              required
              minLength={3}
              maxLength={200}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />

            <p className="mt-2 text-sm text-gray-500">
              Keep the issue title clear and
              specific.
            </p>
          </div>

          <div>
            <label
              htmlFor="issue-description"
              className="block text-sm font-semibold text-gray-800"
            >
              Description
            </label>

            <textarea
              id="issue-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Describe the problem, task, or feature..."
              maxLength={5000}
              rows={7}
              className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />

            <p className="mt-2 text-sm text-gray-500">
              Optional. Maximum 5000 characters.
            </p>
          </div>

          <div>
            <label
              htmlFor="issue-priority"
              className="block text-sm font-semibold text-gray-800"
            >
              Priority
            </label>

            <select
              id="issue-priority"
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target
                    .value as IssuePriority,
                )
              }
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            >
              <option value="LOW">
                Low
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="HIGH">
                High
              </option>

              <option value="URGENT">
                Urgent
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="issue-assignee"
              className="block text-sm font-semibold text-gray-800"
            >
              Assignee
            </label>

            <select
              id="issue-assignee"
              value={assigneeId}
              disabled={isMembersLoading}
              onChange={(event) =>
                setAssigneeId(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                Unassigned
              </option>

              {members.map((member) => (
                <option
                  key={member.user.id}
                  value={member.user.id}
                >
                  {member.user.name} (
                  {member.user.email})
                </option>
              ))}
            </select>

            <p className="mt-2 text-sm text-gray-500">
              {isMembersLoading
                ? "Loading workspace members..."
                : "Select a workspace member or leave the issue unassigned."}
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
          <Link
            to={`/app/projects/${projectId}/issues`}
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
              : "Create issue"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateIssuePage;