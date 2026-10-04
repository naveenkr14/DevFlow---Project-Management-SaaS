import { createContext } from "react";

import type {
  CreateWorkspaceInput,
  Workspace,
  WorkspaceMembership,
} from "./workspace.api";

export type WorkspaceContextValue = {
  workspace: Workspace | null;
  membership: WorkspaceMembership | null;
  isWorkspaceLoading: boolean;
  createNewWorkspace: (
    input: CreateWorkspaceInput,
  ) => Promise<void>;
  clearWorkspace: () => void;
};

export const WorkspaceContext = createContext<
  WorkspaceContextValue | undefined
>(undefined);
