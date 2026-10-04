import {
  countWorkspaceAdmins,
  createWorkspaceMember,
  createWorkspaceWithOwner,
  deleteWorkspaceMember,
  findUserByEmail,
  findWorkspaceById,
  findWorkspaceBySlug,
  findWorkspaceMembership,
  findWorkspaceMembers,
  updateWorkspaceMemberRole,
} from "./workspace.repository.js";

import type {
  AddWorkspaceMemberInput,
  CreateWorkspaceInput,
  UpdateWorkspaceMemberInput,
} from "./workspace.schema.js";

type WorkspaceRole =
  | "ADMIN"
  | "MANAGER"
  | "DEVELOPER"
  | "VIEWER";

const roleLevel: Record<
  WorkspaceRole,
  number
> = {
  VIEWER: 1,
  DEVELOPER: 2,
  MANAGER: 3,
  ADMIN: 4,
};

const canManageTargetRole = (
  actorRole: WorkspaceRole,
  targetRole: WorkspaceRole,
) => {
  if (actorRole === "ADMIN") {
    return true;
  }

  return (
    roleLevel[actorRole] >
    roleLevel[targetRole]
  );
};

export const createWorkspace = async (
  data: CreateWorkspaceInput,
  ownerId: string,
) => {
  const existingWorkspace =
    await findWorkspaceBySlug(data.slug);

  if (existingWorkspace) {
    throw new Error(
      "WORKSPACE_SLUG_ALREADY_EXISTS",
    );
  }

  return createWorkspaceWithOwner({
    name: data.name,
    slug: data.slug,
    ownerId,
  });
};

export const getWorkspace = async (
  workspaceId: string,
) => {
  const workspace =
    await findWorkspaceById(workspaceId);

  if (!workspace) {
    throw new Error("WORKSPACE_NOT_FOUND");
  }

  return workspace;
};

export const getWorkspaceBySlug = async (
  workspaceSlug: string,
  userId: string,
) => {
  const workspace = await findWorkspaceBySlug(
    workspaceSlug,
  );

  if (!workspace) {
    throw new Error("WORKSPACE_NOT_FOUND");
  }

  const membership =
    await findWorkspaceMembership(
      workspace.id,
      userId,
    );

  if (!membership) {
    throw new Error("WORKSPACE_ACCESS_DENIED");
  }

  return workspace;
};

export const getWorkspaceMembers = async (
  workspaceId: string,
) => {
  return findWorkspaceMembers(workspaceId);
};

export const addWorkspaceMember = async (
  workspaceId: string,
  data: AddWorkspaceMemberInput,
) => {
  const user = await findUserByEmail(
    data.email,
  );

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const existingMembership =
    await findWorkspaceMembership(
      workspaceId,
      user.id,
    );

  if (existingMembership) {
    throw new Error("USER_ALREADY_MEMBER");
  }

  return createWorkspaceMember({
    workspaceId,
    userId: user.id,
    role: data.role,
  });
};

export const updateWorkspaceMember = async (
  workspaceId: string,
  userId: string,
  actorUserId: string,
  actorRole: WorkspaceRole,
  data: UpdateWorkspaceMemberInput,
) => {
  if (userId === actorUserId) {
    throw new Error("CANNOT_CHANGE_OWN_ROLE");
  }

  const membership =
    await findWorkspaceMembership(
      workspaceId,
      userId,
    );

  if (!membership) {
    throw new Error("MEMBERSHIP_NOT_FOUND");
  }

  const targetRole =
    membership.role as WorkspaceRole;

  if (
    !canManageTargetRole(
      actorRole,
      targetRole,
    )
  ) {
    throw new Error(
      "INSUFFICIENT_ROLE_AUTHORITY",
    );
  }

  if (
    actorRole !== "ADMIN" &&
    data.role === "ADMIN"
  ) {
    throw new Error(
      "ONLY_ADMIN_CAN_GRANT_ADMIN",
    );
  }

  if (
    targetRole === "ADMIN" &&
    data.role !== "ADMIN"
  ) {
    const adminCount =
      await countWorkspaceAdmins(
        workspaceId,
      );

    if (adminCount <= 1) {
      throw new Error(
        "CANNOT_REMOVE_LAST_ADMIN",
      );
    }
  }

  return updateWorkspaceMemberRole(
    workspaceId,
    userId,
    data.role,
  );
};

export const removeWorkspaceMember = async (
  workspaceId: string,
  userId: string,
  actorUserId: string,
  actorRole: WorkspaceRole,
) => {
  if (userId === actorUserId) {
    throw new Error("CANNOT_REMOVE_SELF");
  }

  const membership =
    await findWorkspaceMembership(
      workspaceId,
      userId,
    );

  if (!membership) {
    throw new Error("MEMBERSHIP_NOT_FOUND");
  }

  const targetRole =
    membership.role as WorkspaceRole;

  if (
    !canManageTargetRole(
      actorRole,
      targetRole,
    )
  ) {
    throw new Error(
      "INSUFFICIENT_ROLE_AUTHORITY",
    );
  }

  if (targetRole === "ADMIN") {
    throw new Error("CANNOT_REMOVE_ADMIN");
  }

  return deleteWorkspaceMember(
    workspaceId,
    userId,
  );
};