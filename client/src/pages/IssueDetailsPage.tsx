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
  getIssue,
  updateIssue,
  updateIssueStatus,
} from "../issues/issue.api";

import type {
  Issue,
  IssuePriority,
  IssueStatus,
} from "../issues/issue.types";

import {
  createComment,
  deleteComment,
  getIssueComments,
  updateComment,
} from "../comments/comment.api";

import type {
  Comment,
} from "../comments/comment.types";

import {
  addLabelToIssue,
  getIssueLabels,
  removeLabelFromIssue,
} from "../labels/issue-label.api";

import {
  getProjectLabels,
} from "../labels/label.api";

import type {
  Label,
} from "../labels/label.types";

const IssueDetailsPage = () => {
  const { issueId } = useParams<{
    issueId: string;
  }>();

  const [issue, setIssue] =
    useState<Issue | null>(null);

  const [comments, setComments] =
    useState<Comment[]>([]);

  const [labels, setLabels] =
    useState<Label[]>([]);

  const [availableLabels, setAvailableLabels] =
    useState<Label[]>([]);

  const [commentContent, setCommentContent] =
    useState("");

  const [editingCommentId, setEditingCommentId] =
    useState<string | null>(null);

  const [editingCommentContent, setEditingCommentContent] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isCommentsLoading, setIsCommentsLoading] =
    useState(true);

  const [isLabelsLoading, setIsLabelsLoading] =
    useState(true);

  const [isCreatingComment, setIsCreatingComment] =
    useState(false);

  const [isUpdatingComment, setIsUpdatingComment] =
    useState(false);

  const [deletingCommentId, setDeletingCommentId] =
    useState<string | null>(null);

  const [isUpdatingStatus, setIsUpdatingStatus] =
    useState(false);

  const [isUpdatingPriority, setIsUpdatingPriority] =
    useState(false);

  const [isAddingLabel, setIsAddingLabel] =
    useState(false);

  const [removingLabelId, setRemovingLabelId] =
    useState<string | null>(null);

  const [selectedLabelId, setSelectedLabelId] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [commentError, setCommentError] =
    useState<string | null>(null);

  const [labelError, setLabelError] =
    useState<string | null>(null);

  const loadComments = async () => {
    if (!issueId) {
      setCommentError(
        "Issue ID is missing.",
      );
      setIsCommentsLoading(false);
      return;
    }

    setIsCommentsLoading(true);
    setCommentError(null);

    try {
      const data =
        await getIssueComments(issueId);

      setComments(data);
    } catch (error) {
      if (error instanceof Error) {
        setCommentError(error.message);
      } else {
        setCommentError(
          "Unable to load comments.",
        );
      }
    } finally {
      setIsCommentsLoading(false);
    }
  };

  const loadLabels = async (
    currentIssue: Issue,
  ) => {
    if (!issueId) {
      setLabelError(
        "Issue ID is missing.",
      );
      setIsLabelsLoading(false);
      return;
    }

    setIsLabelsLoading(true);
    setLabelError(null);

    try {
      const [
        issueLabels,
        projectLabels,
      ] = await Promise.all([
        getIssueLabels(issueId),
        getProjectLabels(
          currentIssue.projectId,
        ),
      ]);

      setLabels(issueLabels);
      setAvailableLabels(projectLabels);
    } catch (error) {
      if (error instanceof Error) {
        setLabelError(error.message);
      } else {
        setLabelError(
          "Unable to load labels.",
        );
      }
    } finally {
      setIsLabelsLoading(false);
    }
  };

  useEffect(() => {
    const loadPageData = async () => {
      if (!issueId) {
        setError("Issue ID is missing.");
        setIsLoading(false);
        setIsLabelsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data =
          await getIssue(issueId);

        setIssue(data);

        await Promise.all([
          loadComments(),
          loadLabels(data),
        ]);
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
      }
    };

    void loadPageData();
  }, [issueId]);

  const handleStatusChange = async (
    newStatus: IssueStatus,
  ) => {
    if (!issueId || !issue) {
      return;
    }

    const previousStatus =
      issue.status;

    setIsUpdatingStatus(true);
    setError(null);

    setIssue({
      ...issue,
      status: newStatus,
    });

    try {
      const updatedIssue =
        await updateIssueStatus(
          issueId,
          {
            status: newStatus,
          },
        );

      setIssue(updatedIssue);
    } catch (error) {
      setIssue({
        ...issue,
        status: previousStatus,
      });

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to update issue status.",
        );
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (
    newPriority: IssuePriority,
  ) => {
    if (!issueId || !issue) {
      return;
    }

    const previousPriority =
      issue.priority;

    setIsUpdatingPriority(true);
    setError(null);

    setIssue({
      ...issue,
      priority: newPriority,
    });

    try {
      const updatedIssue =
        await updateIssue(
          issueId,
          {
            priority: newPriority,
          },
        );

      setIssue(updatedIssue);
    } catch (error) {
      setIssue({
        ...issue,
        priority: previousPriority,
      });

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to update issue priority.",
        );
      }
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  const handleAddLabel = async () => {
    if (!issueId || !selectedLabelId) {
      return;
    }

    setIsAddingLabel(true);
    setLabelError(null);

    try {
      const addedLabel =
        await addLabelToIssue(
          issueId,
          selectedLabelId,
        );

      setLabels((currentLabels) => {
        const alreadyExists =
          currentLabels.some(
            (label) =>
              label.id ===
              addedLabel.id,
          );

        if (alreadyExists) {
          return currentLabels;
        }

        return [
          ...currentLabels,
          addedLabel,
        ];
      });

      setSelectedLabelId("");
    } catch (error) {
      if (error instanceof Error) {
        setLabelError(error.message);
      } else {
        setLabelError(
          "Unable to add label.",
        );
      }
    } finally {
      setIsAddingLabel(false);
    }
  };

  const handleRemoveLabel = async (
    labelId: string,
  ) => {
    if (!issueId) {
      return;
    }

    setRemovingLabelId(labelId);
    setLabelError(null);

    try {
      await removeLabelFromIssue(
        issueId,
        labelId,
      );

      setLabels((currentLabels) =>
        currentLabels.filter(
          (label) =>
            label.id !== labelId,
        ),
      );
    } catch (error) {
      if (error instanceof Error) {
        setLabelError(error.message);
      } else {
        setLabelError(
          "Unable to remove label.",
        );
      }
    } finally {
      setRemovingLabelId(null);
    }
  };

  const handleCreateComment = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!issueId) {
      setCommentError(
        "Issue ID is missing.",
      );
      return;
    }

    const content =
      commentContent.trim();

    if (!content) {
      setCommentError(
        "Comment cannot be empty.",
      );
      return;
    }

    setIsCreatingComment(true);
    setCommentError(null);

    try {
      const newComment =
        await createComment(
          issueId,
          {
            content,
          },
        );

      setComments((currentComments) => [
        ...currentComments,
        newComment,
      ]);

      setCommentContent("");
    } catch (error) {
      if (error instanceof Error) {
        setCommentError(error.message);
      } else {
        setCommentError(
          "Unable to create comment.",
        );
      }
    } finally {
      setIsCreatingComment(false);
    }
  };

  const handleStartEditComment = (
    comment: Comment,
  ) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(
      comment.content,
    );
    setCommentError(null);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
  };

  const handleUpdateComment = async (
    commentId: string,
  ) => {
    const content =
      editingCommentContent.trim();

    if (!content) {
      setCommentError(
        "Comment cannot be empty.",
      );
      return;
    }

    setIsUpdatingComment(true);
    setCommentError(null);

    try {
      const updatedComment =
        await updateComment(
          commentId,
          {
            content,
          },
        );

      setComments((currentComments) =>
        currentComments.map((comment) =>
          comment.id === commentId
            ? updatedComment
            : comment,
        ),
      );

      handleCancelEditComment();
    } catch (error) {
      if (error instanceof Error) {
        setCommentError(error.message);
      } else {
        setCommentError(
          "Unable to update comment.",
        );
      }
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleDeleteComment = async (
    commentId: string,
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this comment?",
      );

    if (!confirmed) {
      return;
    }

    setDeletingCommentId(commentId);
    setCommentError(null);

    try {
      await deleteComment(commentId);

      setComments((currentComments) =>
        currentComments.filter(
          (comment) =>
            comment.id !== commentId,
        ),
      );

      if (
        editingCommentId ===
        commentId
      ) {
        handleCancelEditComment();
      }
    } catch (error) {
      if (error instanceof Error) {
        setCommentError(error.message);
      } else {
        setCommentError(
          "Unable to delete comment.",
        );
      }
    } finally {
      setDeletingCommentId(null);
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

  const attachedLabelIds =
    new Set(
      labels.map(
        (label) => label.id,
      ),
    );

  const labelsAvailableToAdd =
    availableLabels.filter(
      (label) =>
        !attachedLabelIds.has(
          label.id,
        ),
    );

  return (
    <div className="space-y-8">
      <div>
        <Link
          to={`/app/projects/${issue.projectId}/issues`}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to issues
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
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

            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              {issue.title}
            </h1>

            <p className="mt-4 max-w-3xl whitespace-pre-wrap leading-7 text-gray-600">
              {issue.description ||
                "No description provided."}
            </p>
          </div>

          <Link
            to={`/app/issues/${issue.id}/edit`}
            className="shrink-0 rounded-lg border border-gray-300 px-5 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Edit issue
          </Link>
        </div>
      </section>

      {/* Labels */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Labels
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Organize this issue using
              project labels.
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {labels.length}
          </span>
        </div>

        {labelError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {labelError}
            </p>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {isLabelsLoading ? (
            <p className="text-sm text-gray-600">
              Loading labels...
            </p>
          ) : (
            <>
              {labels.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
                  <p className="text-sm text-gray-600">
                    No labels attached to this
                    issue.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {labels.map((label) => (
                    <div
                      key={label.id}
                      className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-sm"
                    >
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            label.color,
                        }}
                        aria-hidden="true"
                      />

                      <span className="text-sm font-medium text-gray-800">
                        {label.name}
                      </span>

                      <button
                        type="button"
                        disabled={
                          removingLabelId ===
                          label.id
                        }
                        onClick={() =>
                          void handleRemoveLabel(
                            label.id,
                          )
                        }
                        className="ml-1 text-xs font-bold text-gray-400 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Remove ${label.name} label`}
                        title={`Remove ${label.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 border-t border-gray-100 pt-5">
                <label
                  htmlFor="add-issue-label"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Add label
                </label>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <select
                    id="add-issue-label"
                    value={selectedLabelId}
                    onChange={(event) =>
                      setSelectedLabelId(
                        event.target.value,
                      )
                    }
                    disabled={
                      isAddingLabel ||
                      labelsAvailableToAdd.length ===
                        0
                    }
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    <option value="">
                      {labelsAvailableToAdd.length ===
                      0
                        ? "All project labels are attached"
                        : "Select a label"}
                    </option>

                    {labelsAvailableToAdd.map(
                      (label) => (
                        <option
                          key={label.id}
                          value={label.id}
                        >
                          {label.name} —{" "}
                          {label.color}
                        </option>
                      ),
                    )}
                  </select>

                  <button
                    type="button"
                    disabled={
                      isAddingLabel ||
                      !selectedLabelId
                    }
                    onClick={() =>
                      void handleAddLabel()
                    }
                    className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAddingLabel
                      ? "Adding..."
                      : "Add label"}
                  </button>
                </div>

                {availableLabels.length ===
                  0 && (
                  <p className="mt-3 text-xs text-gray-500">
                    This project has no labels
                    yet. Create one from the
                    project Labels page.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900">
          Issue details
        </h2>

        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="issue-status"
              className="block text-sm font-medium text-gray-500"
            >
              Status
            </label>

            <select
              id="issue-status"
              value={issue.status}
              disabled={isUpdatingStatus}
              onChange={(event) =>
                void handleStatusChange(
                  event.target
                    .value as IssueStatus,
                )
              }
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-semibold text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="TODO">
                To Do
              </option>

              <option value="IN_PROGRESS">
                In Progress
              </option>

              <option value="IN_REVIEW">
                In Review
              </option>

              <option value="DONE">
                Done
              </option>
            </select>

            {isUpdatingStatus && (
              <p className="mt-2 text-xs text-gray-500">
                Updating status...
              </p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="issue-priority"
              className="block text-sm font-medium text-gray-500"
            >
              Priority
            </label>

            <select
              id="issue-priority"
              value={issue.priority}
              disabled={isUpdatingPriority}
              onChange={(event) =>
                void handlePriorityChange(
                  event.target
                    .value as IssuePriority,
                )
              }
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-semibold text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
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

            {isUpdatingPriority && (
              <p className="mt-2 text-xs text-gray-500">
                Updating priority...
              </p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Reporter
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900">
              {issue.reporter.name}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {issue.reporter.email}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Assignee
            </p>

            {issue.assignee ? (
              <>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {issue.assignee.name}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {issue.assignee.email}
                </p>
              </>
            ) : (
              <p className="mt-2 text-lg font-semibold text-gray-500">
                Unassigned
              </p>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Comments
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Discuss this issue with your team.
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {comments.length}
          </span>
        </div>

        {commentError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {commentError}
            </p>
          </div>
        )}

        <div className="mt-4 space-y-4">
          {isCommentsLoading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-600">
                Loading comments...
              </p>
            </div>
          ) : comments.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <h3 className="font-semibold text-gray-900">
                No comments yet
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Start the discussion by adding
                the first comment.
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {comment.author.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(
                        comment.createdAt,
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleStartEditComment(
                          comment,
                        )
                      }
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={
                        deletingCommentId ===
                        comment.id
                      }
                      onClick={() =>
                        void handleDeleteComment(
                          comment.id,
                        )
                      }
                      className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingCommentId ===
                      comment.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>

                {editingCommentId ===
                comment.id ? (
                  <div className="mt-4">
                    <textarea
                      value={
                        editingCommentContent
                      }
                      onChange={(event) =>
                        setEditingCommentContent(
                          event.target.value,
                        )
                      }
                      maxLength={5000}
                      rows={5}
                      className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />

                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={
                          handleCancelEditComment
                        }
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        disabled={
                          isUpdatingComment
                        }
                        onClick={() =>
                          void handleUpdateComment(
                            comment.id,
                          )
                        }
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdatingComment
                          ? "Saving..."
                          : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {comment.content}
                  </p>
                )}
              </article>
            ))
          )}
        </div>

        <form
          onSubmit={handleCreateComment}
          className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <label
            htmlFor="new-comment"
            className="block text-sm font-semibold text-gray-800"
          >
            Add a comment
          </label>

          <textarea
            id="new-comment"
            value={commentContent}
            onChange={(event) =>
              setCommentContent(
                event.target.value,
              )
            }
            placeholder="Write a comment..."
            maxLength={5000}
            rows={5}
            className="mt-3 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />

          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              Maximum 5000 characters.
            </p>

            <button
              type="submit"
              disabled={
                isCreatingComment ||
                !commentContent.trim()
              }
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingComment
                ? "Adding..."
                : "Add comment"}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900">
          Project
        </h2>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            This issue belongs to
          </p>

          <p className="mt-2 text-lg font-semibold text-gray-900">
            {issue.project.name}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {issue.project.key}
          </p>
        </div>
      </section>
    </div>
  );
};

export default IssueDetailsPage;