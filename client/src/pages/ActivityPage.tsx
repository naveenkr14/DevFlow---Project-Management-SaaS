import {
  useEffect,
  useState,
} from "react";

import { getActivities } from "../activity/activity.api";

import type {
  ActivityItem,
} from "../activity/activity.types";

import {
  useWorkspace,
} from "../workspaces/workspace.context";

const ACTION_OPTIONS = [
  {
    value: "ISSUE_CREATED",
    label: "Issue created",
  },
  {
    value: "ISSUE_UPDATED",
    label: "Issue updated",
  },
  {
    value: "ISSUE_STATUS_CHANGED",
    label: "Issue status changed",
  },
  {
    value: "ISSUE_ASSIGNED",
    label: "Issue assigned",
  },
  {
    value: "ISSUE_PRIORITY_CHANGED",
    label: "Issue priority changed",
  },
  {
    value: "COMMENT_CREATED",
    label: "Comment created",
  },
  {
    value: "COMMENT_UPDATED",
    label: "Comment updated",
  },
  {
    value: "COMMENT_DELETED",
    label: "Comment deleted",
  },
  {
    value: "LABEL_CREATED",
    label: "Label created",
  },
  {
    value: "LABEL_UPDATED",
    label: "Label updated",
  },
  {
    value: "LABEL_DELETED",
    label: "Label deleted",
  },
  {
    value: "LABEL_ADDED_TO_ISSUE",
    label: "Label added to issue",
  },
  {
    value: "LABEL_REMOVED_FROM_ISSUE",
    label: "Label removed from issue",
  },
];

const ENTITY_OPTIONS = [
  {
    value: "ISSUE",
    label: "Issue",
  },
  {
    value: "COMMENT",
    label: "Comment",
  },
  {
    value: "LABEL",
    label: "Label",
  },
];

const getActionLabel = (
  action: string,
) => {
  const option =
    ACTION_OPTIONS.find(
      (item) => item.value === action,
    );

  return option?.label ?? action;
};

const getEntityLabel = (
  entityType: string,
) => {
  const option =
    ENTITY_OPTIONS.find(
      (item) =>
        item.value === entityType,
    );

  return option?.label ?? entityType;
};

const formatDate = (
  value: string,
) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
};

const formatMetadataValue = (
  value: unknown,
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
};

const getMetadataEntries = (
  activity: ActivityItem,
) => {
  return Object.entries(
    activity.metadata ?? {},
  ).filter(
    ([, value]) =>
      value !== null &&
      value !== undefined,
  );
};

const ActivityPage = () => {
  const {
    workspace,
    isWorkspaceLoading,
  } = useWorkspace();

  const [activities, setActivities] =
    useState<ActivityItem[]>([]);

  const [actionFilter, setActionFilter] =
    useState("");

  const [entityTypeFilter, setEntityTypeFilter] =
    useState("");

  const [nextCursor, setNextCursor] =
    useState<string | null>(null);

  const [hasNextPage, setHasNextPage] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isLoadingMore, setIsLoadingMore] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadActivities = async (
    cursor?: string,
    append = false,
  ) => {
    if (!workspace?.id) {
      setIsLoading(false);
      return;
    }

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const response =
        await getActivities(
          workspace.id,
          {
            action:
              actionFilter || undefined,
            entityType:
              entityTypeFilter || undefined,
            limit: 20,
            cursor,
          },
        );

      setActivities(
        (currentActivities) =>
          append
            ? [
                ...currentActivities,
                ...response.data,
              ]
            : response.data,
      );

      setHasNextPage(
        response.pagination.hasNextPage,
      );

      setNextCursor(
        response.pagination.nextCursor,
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to load activity.",
        );
      }

      if (!append) {
        setActivities([]);
        setHasNextPage(false);
        setNextCursor(null);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setActivities([]);
    setNextCursor(null);
    setHasNextPage(false);

    void loadActivities();
  }, [
    workspace?.id,
    actionFilter,
    entityTypeFilter,
  ]);

  const handleRefresh = () => {
    setActivities([]);
    setNextCursor(null);
    setHasNextPage(false);

    void loadActivities();
  };

  const handleLoadMore = () => {
    if (
      !nextCursor ||
      isLoadingMore
    ) {
      return;
    }

    void loadActivities(
      nextCursor,
      true,
    );
  };

  if (isWorkspaceLoading || isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">
          Loading activity...
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
          Create or select a workspace
          before viewing activity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Workspace
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Activity
            </h1>

            <p className="mt-2 text-gray-600">
              Review important changes and
              activity across your workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="activity-action"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Action
            </label>

            <select
              id="activity-action"
              value={actionFilter}
              onChange={(event) => {
                setActionFilter(
                  event.target.value,
                );
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            >
              <option value="">
                All actions
              </option>

              {ACTION_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="activity-entity"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Entity
            </label>

            <select
              id="activity-entity"
              value={entityTypeFilter}
              onChange={(event) => {
                setEntityTypeFilter(
                  event.target.value,
                );
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            >
              <option value="">
                All entities
              </option>

              {ENTITY_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">
            Unable to load activity
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>
        </section>
      )}

      {/* Activity list */}
      {!error &&
      activities.length === 0 ? (
        <section className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto max-w-md">
            <h2 className="text-xl font-semibold text-gray-900">
              No activity found
            </h2>

            <p className="mt-2 text-gray-600">
              There is no activity matching
              the selected filters.
            </p>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <p className="text-sm font-medium text-gray-600">
              {activities.length}{" "}
              {activities.length === 1
                ? "activity"
                : "activities"}
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {activities.map(
              (activity) => {
                const metadataEntries =
                  getMetadataEntries(
                    activity,
                  );

                return (
                  <article
                    key={activity.id}
                    className="px-6 py-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            {getEntityLabel(
                              activity.entityType,
                            )}
                          </span>

                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            {getActionLabel(
                              activity.action,
                            )}
                          </span>
                        </div>

                        <h2 className="mt-3 text-base font-semibold text-gray-900">
                          {getActionLabel(
                            activity.action,
                          )}
                        </h2>

                        <p className="mt-1 text-sm text-gray-600">
                          {activity.user?.name ||
                            "Unknown user"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(
                            activity.createdAt,
                          )}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Entity ID
                        </p>

                        <p className="mt-1 max-w-xs break-all text-xs text-gray-500">
                          {activity.entityId}
                        </p>
                      </div>
                    </div>

                    {metadataEntries.length > 0 && (
                      <div className="mt-5 rounded-lg bg-gray-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Details
                        </p>

                        <dl className="mt-3 space-y-2">
                          {metadataEntries.map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
                              >
                                <dt className="text-sm font-medium text-gray-600">
                                  {key}
                                </dt>

                                <dd className="break-all text-sm text-gray-900 sm:max-w-[70%] sm:text-right">
                                  {formatMetadataValue(
                                    value,
                                  )}
                                </dd>
                              </div>
                            ),
                          )}
                        </dl>
                      </div>
                    )}
                  </article>
                );
              },
            )}
          </div>
        </section>
      )}

      {/* Pagination */}
      {hasNextPage &&
        nextCursor && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingMore
                ? "Loading..."
                : "Load more"}
            </button>
          </div>
        )}
    </div>
  );
};

export default ActivityPage;