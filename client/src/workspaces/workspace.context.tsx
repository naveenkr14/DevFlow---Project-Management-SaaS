import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";

import { useAuth } from "../auth/auth.hook";

import {
  createWorkspace,
  getWorkspace,
  getWorkspaceBySlug,
  type CreateWorkspaceInput,
  type Workspace,
  type WorkspaceMembership,
} from "./workspace.api";
import { WorkspaceContext } from "./workspace.store";

const CURRENT_WORKSPACE_KEY =
  "devflow_current_workspace_id";

const WORKSPACE_PATH_PATTERN =
  /^\/app\/workspaces\/([^/]+)/;

type WorkspaceProviderProps = {
  children: ReactNode;
};

export const WorkspaceProvider = ({
  children,
}: WorkspaceProviderProps) => {
  const location = useLocation();
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuth();

  const [workspace, setWorkspace] =
    useState<Workspace | null>(null);

  const [membership, setMembership] =
    useState<WorkspaceMembership | null>(null);

  const [isWorkspaceLoading, setIsWorkspaceLoading] =
    useState(true);

  useEffect(() => {
    const restoreWorkspace = async () => {
      if (isAuthLoading) {
        setIsWorkspaceLoading(true);
        return;
      }

      if (!isAuthenticated) {
        setWorkspace(null);
        setMembership(null);
        setIsWorkspaceLoading(false);
        return;
      }

      const workspacePathMatch =
        location.pathname.match(
          WORKSPACE_PATH_PATTERN,
        );

      const workspaceSlug = workspacePathMatch?.[1]
        ? decodeURIComponent(
            workspacePathMatch[1],
          )
        : null;

      const storedWorkspaceId = localStorage.getItem(
        CURRENT_WORKSPACE_KEY,
      );

      if (!workspaceSlug && !storedWorkspaceId) {
        setWorkspace(null);
        setMembership(null);
        setIsWorkspaceLoading(false);
        return;
      }

      setIsWorkspaceLoading(true);

      try {
        const restoredWorkspace = workspaceSlug
          ? await getWorkspaceBySlug(workspaceSlug)
          : await getWorkspace(storedWorkspaceId!);

        setWorkspace(restoredWorkspace);
        setMembership(null);

        localStorage.setItem(
          CURRENT_WORKSPACE_KEY,
          restoredWorkspace.id,
        );
      } catch (error) {
        console.error(
          "Failed to restore workspace:",
          error,
        );

        setWorkspace(null);
        setMembership(null);

        if (workspaceSlug) {
          localStorage.removeItem(
            CURRENT_WORKSPACE_KEY,
          );
        }
      } finally {
        setIsWorkspaceLoading(false);
      }
    };

    void restoreWorkspace();
  }, [
    isAuthLoading,
    isAuthenticated,
    location.pathname,
  ]);

  const createNewWorkspace = useCallback(async (
    input: CreateWorkspaceInput,
  ) => {
    const result = await createWorkspace(input);

    setWorkspace(result.workspace);
    setMembership(result.membership);

    localStorage.setItem(
      CURRENT_WORKSPACE_KEY,
      result.workspace.id,
    );
  }, []);

  const clearWorkspace = useCallback(() => {
    setWorkspace(null);
    setMembership(null);

    localStorage.removeItem(
      CURRENT_WORKSPACE_KEY,
    );
  }, []);

  const value = useMemo(
    () => ({
      workspace,
      membership,
      isWorkspaceLoading,
      createNewWorkspace,
      clearWorkspace,
    }),
    [
      workspace,
      membership,
      isWorkspaceLoading,
      createNewWorkspace,
      clearWorkspace,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};
