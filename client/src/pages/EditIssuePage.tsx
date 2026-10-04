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

import {
  getIssue,
  updateIssue,
} from "../issues/issue.api";

import type {
  Issue,
  IssuePriority,
} from "../issues/issue.types";

import {
  getWorkspaceMembers,
  type WorkspaceMember,
} from "../workspaces/workspace.api";

const EditIssuePage = () => {
  const navigate = useNavigate();

  const { issueId } = useParams<{
    issueId: string;
  }>();

  const [issue, setIssue] =
    useState<Issue | null>(null);

  const [members, setMembers] =
    useState<WorkspaceMember[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState<IssuePriority>("MEDIUM");

  const [assigneeId, setAssigneeId] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isMembersLoading, setIsMembersLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadIssue = async () => {
      if (!issueId) {
        setError("Issue ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data =
          await getIssue(issueId);

        setIssue(data);
        setTitle(data.title);
        setDescription(
          data.description ?? "",
        );
        setPriority(data.priority);
        setAssigneeId(
          data.assigneeId ?? "",
        );

        const members =
          await getWorkspaceMembers(
            data.project.workspaceId,
          );

        setMembers(members);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Unable to load issue.",
          );
        }
      } finally {
        setIsLoading(false);
        setIsMembersLoading(false);
      }
    };

    void loadIssue();
  }, [issueId]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!issueId) {
      setError("Issue ID is missing.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateIssue(
        issueId,
        {
          title: title.trim(),
          description:
            description.trim() || undefined,
          priority,
          assigneeId:
            assigneeId || null,
        },
      );

      navigate(
        `/app/issues/${issueId}`,
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to update issue.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">
          Loading issue...
        </p>
      </div>
    );
  }

  if (error && !issue) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <Link
          to="/app/projects"
          className="text-sm font-medium text-red-700 hover:underline"
        >
          ← Back to projects
        </Link>

        <h2 className="mt-6 text-lg font-semibold text-red-900">
          Unable to load issue
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Issue not found
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
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link
          to={`/app/issues/${issue.id}`}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to issue
        </Link>

        <div className="mt-6">
          <p className="text-sm font-bold tracking-wide text-gray-500">
            {issue.key}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Edit issue
          </h1>

          <p className="mt-2 text-gray-600">
            Update the details of this issue.
          </p>
        </div>
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
              htmlFor="edit-issue-title"
              className="block text-sm font-semibold text-gray-800"
            >
              Title
            </label>

            <input
              id="edit-issue-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              required
              minLength={3}
              maxLength={200}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="edit-issue-description"
              className="block text-sm font-semibold text-gray-800"
            >
              Description
            </label>

            <textarea
              id="edit-issue-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              maxLength={5000}
              rows={7}
              className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />

            <p className="mt-2 text-sm text-gray-500">
              Maximum 5000 characters.
            </p>
          </div>

          <div>
            <label
              htmlFor="edit-issue-priority"
              className="block text-sm font-semibold text-gray-800"
            >
              Priority
            </label>

            <select
              id="edit-issue-priority"
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
              htmlFor="edit-issue-assignee"
              className="block text-sm font-semibold text-gray-800"
            >
              Assignee
            </label>

            <select
              id="edit-issue-assignee"
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
            to={`/app/issues/${issue.id}`}
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
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditIssuePage;