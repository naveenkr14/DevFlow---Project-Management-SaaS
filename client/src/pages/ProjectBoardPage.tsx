import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getProjectBoard,
} from "../board/board.api";

import type {
  BoardIssue,
  BoardIssuePriority,
  BoardIssueStatus,
  ProjectBoard,
} from "../board/board.types";

import {
  updateIssueStatus,
} from "../issues/issue.api";

const COLUMN_CONFIG: {
  status: BoardIssueStatus;
  title: string;
}[] = [
  {
    status: "TODO",
    title: "Todo",
  },
  {
    status: "IN_PROGRESS",
    title: "In Progress",
  },
  {
    status: "IN_REVIEW",
    title: "In Review",
  },
  {
    status: "DONE",
    title: "Done",
  },
];

const PRIORITY_CLASSES: Record<
  BoardIssuePriority,
  string
> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

const getColumnIssues = (
  board: ProjectBoard,
  status: BoardIssueStatus,
): BoardIssue[] => {
  const columns = board.columns as unknown;

  /*
   * Structure 1:
   *
   * columns: [
   *   {
   *     status: "TODO",
   *     issues: [...]
   *   }
   * ]
   */
  if (Array.isArray(columns)) {
    const column = columns.find(
      (item) =>
        item.status === status,
    );

    return column?.issues ?? [];
  }

  /*
   * Structure 2:
   *
   * columns: {
   *   TODO: [...],
   *   IN_PROGRESS: [...],
   *   IN_REVIEW: [...],
   *   DONE: [...]
   * }
   */
  if (
    columns !== null &&
    typeof columns === "object"
  ) {
    const columnMap =
      columns as Record<
        string,
        unknown
      >;

    const issues =
      columnMap[status];

    if (Array.isArray(issues)) {
      return issues as BoardIssue[];
    }

    /*
     * Structure 3:
     *
     * columns: {
     *   TODO: {
     *     issues: [...]
     *   }
     * }
     */
    if (
      issues !== null &&
      typeof issues === "object" &&
      "issues" in issues
    ) {
      const column =
        issues as {
          issues?: unknown;
        };

      if (
        Array.isArray(
          column.issues,
        )
      ) {
        return column.issues as BoardIssue[];
      }
    }
  }

  return [];
};

const ProjectBoardPage = () => {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const [board, setBoard] =
    useState<ProjectBoard | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    updatingIssueId,
    setUpdatingIssueId,
  ] = useState<string | null>(null);

  const [
    draggedIssueId,
    setDraggedIssueId,
  ] = useState<string | null>(null);

  const [
    draggedOverStatus,
    setDraggedOverStatus,
  ] = useState<BoardIssueStatus | null>(
    null,
  );

  useEffect(() => {
    const loadBoard = async () => {
      if (!projectId) {
        setError(
          "Project ID is missing.",
        );
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data =
          await getProjectBoard(
            projectId,
          );

        setBoard(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Unable to load project board.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadBoard();
  }, [projectId]);

  const handleStatusChange = async (
    issueId: string,
    newStatus: BoardIssueStatus,
  ) => {
    if (!projectId) {
      setError(
        "Project ID is missing.",
      );
      return;
    }

    setUpdatingIssueId(issueId);
    setError(null);

    try {
      await updateIssueStatus(
        issueId,
        {
          status: newStatus,
        },
      );

      /*
       * Reload the board from the backend
       * after the status update succeeds.
       */
      const updatedBoard =
        await getProjectBoard(
          projectId,
        );

      setBoard(updatedBoard);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to update issue status.",
        );
      }
    } finally {
      setUpdatingIssueId(null);
      setDraggedIssueId(null);
      setDraggedOverStatus(null);
    }
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLElement>,
    issueId: string,
  ) => {
    setDraggedIssueId(issueId);

    event.dataTransfer.effectAllowed =
      "move";

    event.dataTransfer.setData(
      "text/plain",
      issueId,
    );
  };

  const handleDragEnd = () => {
    setDraggedIssueId(null);
    setDraggedOverStatus(null);
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLElement>,
    status: BoardIssueStatus,
  ) => {
    event.preventDefault();

    event.dataTransfer.dropEffect =
      "move";

    setDraggedOverStatus(status);
  };

  const handleDragLeave = (
    event: React.DragEvent<HTMLElement>,
  ) => {
    /*
     * Prevent flickering when moving
     * between children inside the column.
     */
    if (
      event.currentTarget.contains(
        event.relatedTarget as Node,
      )
    ) {
      return;
    }

    setDraggedOverStatus(null);
  };

  const handleDrop = async (
    event: React.DragEvent<HTMLElement>,
    targetStatus: BoardIssueStatus,
  ) => {
    event.preventDefault();

    const issueId =
      event.dataTransfer.getData(
        "text/plain",
      ) || draggedIssueId;

    setDraggedOverStatus(null);

    if (!issueId) {
      setDraggedIssueId(null);
      return;
    }

    /*
     * Find the issue's current status.
     * If the issue is already in the target
     * column, there is nothing to update.
     */
    const currentIssues =
      COLUMN_CONFIG.flatMap(
        (column) =>
          getColumnIssues(
            board as ProjectBoard,
            column.status,
          ).map((issue) => ({
            issue,
            status: column.status,
          })),
      );

    const draggedIssue =
      currentIssues.find(
        (item) =>
          item.issue.id === issueId,
      );

    if (
      draggedIssue?.status ===
      targetStatus
    ) {
      setDraggedIssueId(null);
      return;
    }

    await handleStatusChange(
      issueId,
      targetStatus,
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">
          Loading board...
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

  if (error && !board) {
    return (
      <div className="space-y-6">
        <Link
          to={`/app/projects/${projectId}`}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to project
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">
            Unable to load board
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-gray-600">
          No board data available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          to={`/app/projects/${projectId}`}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to project
        </Link>

        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Project Board
            </h1>

            <p className="mt-2 text-gray-600">
              Drag issues between columns to
              update their status.
            </p>
          </div>

          <Link
            to={`/app/projects/${projectId}/issues/new`}
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            + Create Issue
          </Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Board */}
      <div className="overflow-x-auto pb-4">
        <div className="grid min-w-[1100px] grid-cols-4 gap-5">
          {COLUMN_CONFIG.map(
            (column) => {
              const issues =
                getColumnIssues(
                  board,
                  column.status,
                );

              const isDropTarget =
                draggedOverStatus ===
                  column.status &&
                draggedIssueId !== null;

              return (
                <section
                  key={column.status}
                  onDragOver={(event) =>
                    handleDragOver(
                      event,
                      column.status,
                    )
                  }
                  onDragLeave={
                    handleDragLeave
                  }
                  onDrop={(event) =>
                    void handleDrop(
                      event,
                      column.status,
                    )
                  }
                  className={`min-h-[500px] rounded-xl p-4 transition ${
                    isDropTarget
                      ? "bg-gray-200 ring-2 ring-gray-400"
                      : "bg-gray-100"
                  }`}
                >
                  {/* Column header */}
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">
                      {column.title}
                    </h2>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                      {issues.length}
                    </span>
                  </div>

                  {/* Issues */}
                  <div className="space-y-3">
                    {issues.length ===
                    0 ? (
                      <div
                        className={`rounded-lg border border-dashed p-6 text-center transition ${
                          isDropTarget
                            ? "border-gray-500 bg-white"
                            : "border-gray-300 bg-white/60"
                        }`}
                      >
                        <p className="text-sm text-gray-500">
                          {isDropTarget
                            ? "Drop issue here"
                            : "No issues"}
                        </p>
                      </div>
                    ) : (
                      issues.map(
                        (issue) => (
                          <article
                            key={
                              issue.id
                            }
                            draggable={
                              updatingIssueId !==
                              issue.id
                            }
                            onDragStart={(
                              event,
                            ) =>
                              handleDragStart(
                                event,
                                issue.id,
                              )
                            }
                            onDragEnd={
                              handleDragEnd
                            }
                            className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition ${
                              draggedIssueId ===
                              issue.id
                                ? "cursor-grabbing opacity-50"
                                : "cursor-grab hover:shadow-md"
                            }`}
                          >
                            {/* Issue link */}
                            <Link
                              to={`/app/issues/${issue.id}`}
                              className="block"
                              onClick={(
                                event,
                              ) => {
                                /*
                                 * Don't navigate if the
                                 * user is starting a drag.
                                 */
                                if (
                                  draggedIssueId
                                ) {
                                  event.preventDefault();
                                }
                              }}
                            >
                              <p className="text-xs font-medium text-gray-500">
                                DF-
                                {
                                  issue.issueNumber
                                }
                              </p>

                              <h3 className="mt-2 font-semibold leading-6 text-gray-900">
                                {
                                  issue.title
                                }
                              </h3>

                              {issue.description && (
                                <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-500">
                                  {
                                    issue.description
                                  }
                                </p>
                              )}
                            </Link>

                            {/* Priority + assignee */}
                            <div className="mt-4 flex items-center justify-between gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PRIORITY_CLASSES[issue.priority]}`}
                              >
                                {
                                  issue.priority
                                }
                              </span>

                              {issue.assigneeId ? (
                                <span className="text-xs font-medium text-gray-500">
                                  Assigned
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">
                                  Unassigned
                                </span>
                              )}
                            </div>

                            {/* Status selector */}
                            <div
                              className="mt-4 border-t border-gray-100 pt-4"
                              onPointerDown={(
                                event,
                              ) =>
                                event.stopPropagation()
                              }
                            >
                              <label
                                htmlFor={`status-${issue.id}`}
                                className="block text-xs font-semibold text-gray-500"
                              >
                                Status
                              </label>

                              <select
                                id={`status-${issue.id}`}
                                value={
                                  issue.status
                                }
                                disabled={
                                  updatingIssueId ===
                                  issue.id
                                }
                                onChange={(
                                  event,
                                ) =>
                                  void handleStatusChange(
                                    issue.id,
                                    event
                                      .target
                                      .value as BoardIssueStatus,
                                  )
                                }
                                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
                              >
                                <option value="TODO">
                                  Todo
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

                              {updatingIssueId ===
                                issue.id && (
                                <p className="mt-2 text-xs text-gray-500">
                                  Updating
                                  status...
                                </p>
                              )}
                            </div>
                          </article>
                        ),
                      )
                    )}
                  </div>
                </section>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectBoardPage;