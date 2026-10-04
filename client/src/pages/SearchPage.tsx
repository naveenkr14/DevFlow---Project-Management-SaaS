import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  searchWorkspace,
} from "../search/search.api";

import type {
  SearchIssue,
  SearchProject,
} from "../search/search.types";

import {
  useWorkspace,
} from "../workspaces/workspace.context";

const SearchPage = () => {
  const navigate = useNavigate();

  const {
    workspace,
    isWorkspaceLoading,
  } = useWorkspace();

  const [query, setQuery] =
    useState("");

  const [searchedQuery, setSearchedQuery] =
    useState("");

  const [projects, setProjects] =
    useState<SearchProject[]>([]);

  const [issues, setIssues] =
    useState<SearchIssue[]>([]);

  const [counts, setCounts] =
    useState({
      projects: 0,
      issues: 0,
      total: 0,
    });

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [hasSearched, setHasSearched] =
    useState(false);

  const handleSearch = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedQuery =
      query.trim();

    if (!workspace?.id) {
      setError(
        "No workspace is selected.",
      );
      return;
    }

    if (!trimmedQuery) {
      setError(
        "Enter something to search.",
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response =
        await searchWorkspace(
          workspace.id,
          trimmedQuery,
        );

      setSearchedQuery(
        response.query,
      );

      setProjects(
        response.results.projects,
      );

      setIssues(
        response.results.issues,
      );

      setCounts(
        response.counts,
      );
    } catch (error) {
      setProjects([]);
      setIssues([]);

      setCounts({
        projects: 0,
        issues: 0,
        total: 0,
      });

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to complete the search.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (
    projectId: string,
  ) => {
    navigate(
      `/app/projects/${projectId}`,
    );
  };

  const handleIssueClick = (
    issueId: string,
  ) => {
    navigate(
      `/app/issues/${issueId}`,
    );
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
          Create or select a workspace
          before using search.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <p className="text-sm font-medium text-gray-500">
          Workspace
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Search
        </h1>

        <p className="mt-2 text-gray-600">
          Search projects and issues across
          your workspace.
        </p>
      </section>

      {/* Search form */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <form
          onSubmit={(event) => {
            void handleSearch(event);
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);

              if (error) {
                setError(null);
              }
            }}
            placeholder="Search projects and issues..."
            aria-label="Search projects and issues"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          />

          <button
            type="submit"
            disabled={
              isLoading ||
              !query.trim()
            }
            className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "Searching..."
              : "Search"}
          </button>
        </form>
      </section>

      {/* Error */}
      {error && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">
            Search failed
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>
        </section>
      )}

      {/* Initial state */}
      {!hasSearched &&
        !error && (
          <section className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Search your workspace
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-600">
              Enter a project name, project key,
              issue title, or other supported
              search text.
            </p>
          </section>
        )}

      {/* Results */}
      {hasSearched &&
        !isLoading &&
        !error && (
          <>
            <section className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  Results for{" "}
                  <span className="font-semibold text-gray-900">
                    "{searchedQuery}"
                  </span>
                </p>

                <p className="text-sm font-medium text-gray-600">
                  {counts.total}{" "}
                  {counts.total === 1
                    ? "result"
                    : "results"}
                </p>
              </div>
            </section>

            {counts.total === 0 ? (
              <section className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">
                  No results found
                </h2>

                <p className="mt-2 text-gray-600">
                  Try a different project name,
                  key, issue title, or search term.
                </p>
              </section>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Projects */}
                <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Projects
                      </h2>

                      <span className="text-sm text-gray-500">
                        {counts.projects}
                      </span>
                    </div>
                  </div>

                  {projects.length === 0 ? (
                    <div className="p-6">
                      <p className="text-sm text-gray-500">
                        No matching projects.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {projects.map(
                        (project) => (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => {
                              handleProjectClick(
                                project.id,
                              );
                            }}
                            className="block w-full px-6 py-5 text-left transition hover:bg-gray-50"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                    {project.key}
                                  </span>

                                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                    {project.status}
                                  </span>
                                </div>

                                <h3 className="mt-3 font-semibold text-gray-900">
                                  {project.name}
                                </h3>

                                {project.description && (
                                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                    {
                                      project.description
                                    }
                                  </p>
                                )}
                              </div>

                              <span className="shrink-0 text-sm font-medium text-gray-500">
                                Open →
                              </span>
                            </div>
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </section>

                {/* Issues */}
                <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Issues
                      </h2>

                      <span className="text-sm text-gray-500">
                        {counts.issues}
                      </span>
                    </div>
                  </div>

                  {issues.length === 0 ? (
                    <div className="p-6">
                      <p className="text-sm text-gray-500">
                        No matching issues.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {issues.map(
                        (issue) => (
                          <button
                            key={issue.id}
                            type="button"
                            onClick={() => {
                              handleIssueClick(
                                issue.id,
                              );
                            }}
                            className="block w-full px-6 py-5 text-left transition hover:bg-gray-50"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                    {
                                      issue.project
                                        .key
                                    }{" "}
                                    #
                                    {
                                      issue.issueNumber
                                    }
                                  </span>

                                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                    {
                                      issue.status
                                    }
                                  </span>

                                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                    {
                                      issue.priority
                                    }
                                  </span>
                                </div>

                                <h3 className="mt-3 font-semibold text-gray-900">
                                  {issue.title}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                  {
                                    issue.project
                                      .name
                                  }
                                </p>

                                {issue.description && (
                                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                    {
                                      issue.description
                                    }
                                  </p>
                                )}
                              </div>

                              <span className="shrink-0 text-sm font-medium text-gray-500">
                                Open →
                              </span>
                            </div>
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </section>
              </div>
            )}
          </>
        )}
    </div>
  );
};

export default SearchPage;