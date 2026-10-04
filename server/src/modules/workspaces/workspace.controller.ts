import type { Request, Response } from "express";

import { isValidUUID } from "../../lib/validation.js";

import {
  addWorkspaceMember,
  createWorkspace,
  getWorkspace,
  getWorkspaceBySlug,
  getWorkspaceMembers,
  removeWorkspaceMember,
  updateWorkspaceMember,
} from "./workspace.service.js";

export const createWorkspaceController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await createWorkspace(
      req.body,
      req.user.id,
    );

    res.status(201).json({
      success: true,
      message: "Workspace created successfully.",
      data: {
        workspace: result.workspace,
        membership: {
          id: result.membership.id,
          role: result.membership.role,
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "WORKSPACE_SLUG_ALREADY_EXISTS"
    ) {
      res.status(409).json({
        success: false,
        error: {
          code: "WORKSPACE_SLUG_ALREADY_EXISTS",
          message:
            "A workspace with this slug already exists.",
        },
      });

      return;
    }

    console.error(
      "Workspace creation failed:",
      error,
    );

    res.status(500).json({
      success: false,
      error: {
        code: "WORKSPACE_CREATION_FAILED",
        message: "Unable to create workspace.",
      },
    });
  }
};

export const getWorkspaceBySlugController = async (
  req: Request,
  res: Response,
) => {
  try {
    const workspaceSlug = req.params.workspaceSlug;

    if (typeof workspaceSlug !== "string" || !workspaceSlug) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_WORKSPACE_SLUG",
          message: "Invalid workspace slug.",
        },
      });

      return;
    }

    const workspace = await getWorkspaceBySlug(
      workspaceSlug,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "WORKSPACE_NOT_FOUND"
    ) {
      res.status(404).json({
        success: false,
        error: {
          code: "WORKSPACE_NOT_FOUND",
          message: "Workspace does not exist or you do not have access to it.",
        },
      });

      return;
    }

    if (
      error instanceof Error &&
      error.message === "WORKSPACE_ACCESS_DENIED"
    ) {
      res.status(403).json({
        success: false,
        error: {
          code: "WORKSPACE_ACCESS_DENIED",
          message: "You are not a member of this workspace.",
        },
      });

      return;
    }

    console.error(
      "Workspace slug fetch failed:",
      error,
    );

    res.status(500).json({
      success: false,
      error: {
        code: "WORKSPACE_FETCH_FAILED",
        message: "Unable to fetch workspace.",
      },
    });
  }
};

export const getWorkspaceController = async (
  req: Request,
  res: Response,
) => {
  try {
    const workspaceId = req.params.workspaceId;

    if (
      typeof workspaceId !== "string" ||
      !isValidUUID(workspaceId)
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_WORKSPACE_ID",
          message: "Invalid workspace ID.",
        },
      });

      return;
    }

    const workspace =
      await getWorkspace(workspaceId);

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "WORKSPACE_NOT_FOUND"
    ) {
      res.status(404).json({
        success: false,
        error: {
          code: "WORKSPACE_NOT_FOUND",
          message: "Workspace does not exist.",
        },
      });

      return;
    }

    console.error(
      "Workspace fetch failed:",
      error,
    );

    res.status(500).json({
      success: false,
      error: {
        code: "WORKSPACE_FETCH_FAILED",
        message: "Unable to fetch workspace.",
      },
    });
  }
};

export const getWorkspaceMembersController =
  async (req: Request, res: Response) => {
    try {
      const workspaceId =
        req.params.workspaceId;

      if (
        typeof workspaceId !== "string" ||
        !isValidUUID(workspaceId)
      ) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_WORKSPACE_ID",
            message: "Invalid workspace ID.",
          },
        });

        return;
      }

      const members =
        await getWorkspaceMembers(workspaceId);

      res.status(200).json({
        success: true,
        data: members,
      });
    } catch (error) {
      console.error(
        "Workspace members fetch failed:",
        error,
      );

      res.status(500).json({
        success: false,
        error: {
          code: "WORKSPACE_MEMBERS_FETCH_FAILED",
          message:
            "Unable to fetch workspace members.",
        },
      });
    }
  };

export const addWorkspaceMemberController =
  async (req: Request, res: Response) => {
    try {
      const workspaceId =
        req.params.workspaceId;

      if (
        typeof workspaceId !== "string" ||
        !isValidUUID(workspaceId)
      ) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_WORKSPACE_ID",
            message: "Invalid workspace ID.",
          },
        });

        return;
      }

      const membership =
        await addWorkspaceMember(
          workspaceId,
          req.body,
        );

      res.status(201).json({
        success: true,
        message: "Member added successfully.",
        data: membership,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "USER_NOT_FOUND"
      ) {
        res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message:
              "User with this email does not exist.",
          },
        });

        return;
      }

      if (
        error instanceof Error &&
        error.message ===
          "USER_ALREADY_MEMBER"
      ) {
        res.status(409).json({
          success: false,
          error: {
            code: "USER_ALREADY_MEMBER",
            message:
              "User is already a workspace member.",
          },
        });

        return;
      }

      console.error(
        "Adding workspace member failed:",
        error,
      );

      res.status(500).json({
        success: false,
        error: {
          code: "MEMBER_ADD_FAILED",
          message:
            "Unable to add workspace member.",
        },
      });
    }
  };

export const updateWorkspaceMemberController =
  async (req: Request, res: Response) => {
    try {
      const workspaceId =
        req.params.workspaceId;

      const userId = req.params.userId;

      if (
        typeof workspaceId !== "string" ||
        !isValidUUID(workspaceId)
      ) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_WORKSPACE_ID",
            message: "Invalid workspace ID.",
          },
        });

        return;
      }

      if (
        typeof userId !== "string" ||
        !isValidUUID(userId)
      ) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_USER_ID",
            message: "Invalid user ID.",
          },
        });

        return;
      }

      const membership =
        await updateWorkspaceMember(
          workspaceId,
          userId,
          req.user.id,
          req.workspaceMembership.role,
          req.body,
        );

      res.status(200).json({
        success: true,
        message:
          "Member role updated successfully.",
        data: membership,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "MEMBERSHIP_NOT_FOUND"
      ) {
        res.status(404).json({
          success: false,
          error: {
            code: "MEMBERSHIP_NOT_FOUND",
            message:
              "Workspace membership does not exist.",
          },
        });

        return;
      }

      if (
        error instanceof Error &&
        error.message ===
          "CANNOT_CHANGE_OWN_ROLE"
      ) {
        res.status(403).json({
          success: false,
          error: {
            code: "CANNOT_CHANGE_OWN_ROLE",
            message:
              "You cannot change your own workspace role.",
          },
        });

        return;
      }

      if (
        error instanceof Error &&
        error.message ===
          "INSUFFICIENT_ROLE_AUTHORITY"
      ) {
        res.status(403).json({
          success: false,
          error: {
            code:
              "INSUFFICIENT_ROLE_AUTHORITY",
            message:
              "You cannot manage a member with equal or higher authority.",
          },
        });

        return;
      }

      if (
        error instanceof Error &&
        error.message ===
          "ONLY_ADMIN_CAN_GRANT_ADMIN"
      ) {
        res.status(403).json({
          success: false,
          error: {
            code:
              "ONLY_ADMIN_CAN_GRANT_ADMIN",
            message:
              "Only an admin can grant the ADMIN role.",
          },
        });

        return;
      }

      if (
        error instanceof Error &&
        error.message ===
          "CANNOT_REMOVE_LAST_ADMIN"
      ) {
        res.status(403).json({
          success: false,
          error: {
            code:
              "CANNOT_REMOVE_LAST_ADMIN",
            message:
              "The workspace must have at least one admin.",
          },
        });

        return;
      }

      console.error(
        "Updating workspace member failed:",
        error,
      );

      res.status(500).json({
        success: false,
        error: {
          code: "MEMBER_UPDATE_FAILED",
          message:
            "Unable to update workspace member.",
        },
      });
    }
  };

export const removeWorkspaceMemberController =
  async (req: Request, res: Response) => {
    try {
      const workspaceId =
        req.params.workspaceId;

      const userId = req.params.userId;

      if (
        typeof workspaceId !== "string" ||
        !isValidUUID(workspaceId)
      ) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_WORKSPACE_ID",
            message: "Invalid workspace ID.",
          },
        });

        return;
      }

      if (
        typeof userId !== "string" ||
        !isValidUUID(userId)
      ) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_USER_ID",
            message: "Invalid user ID.",
          },
        });

        return;
      }

      await removeWorkspaceMember(
        workspaceId,
        userId,
        req.user.id,
        req.workspaceMembership.role,
      );

      res.status(204).send();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "MEMBERSHIP_NOT_FOUND"
      ) {
        res.status(404).json({
          success: false,
          error: {
            code: "MEMBERSHIP_NOT_FOUND",
            message:
              "Workspace membership does not exist.",
          },
        });

        return;
      }

      if (
        error instanceof Error &&
        error.message ===
          "CANNOT_REMOVE_SELF"
      ) {
        res.status(403).json({
          success: false,
          error: {
            code: "CANNOT_REMOVE_SELF",
            message:
              "You cannot remove yourself from the workspace.",
          },
        });

        return;
      }

      if (
        error instanceof Error &&
        error.message ===
          "INSUFFICIENT_ROLE_AUTHORITY"
      ) {
        res.status(403).json({
          success: false,
          error: {
            code:
              "INSUFFICIENT_ROLE_AUTHORITY",
            message:
              "You cannot remove a member with equal or higher authority.",
          },
        });

        return;
      }

      if (
        error instanceof Error &&
        error.message ===
          "CANNOT_REMOVE_ADMIN"
      ) {
        res.status(403).json({
          success: false,
          error: {
            code: "CANNOT_REMOVE_ADMIN",
            message:
              "An admin cannot be removed from the workspace.",
          },
        });

        return;
      }

      if (
        error instanceof Error &&
        error.message ===
          "CANNOT_REMOVE_LAST_ADMIN"
      ) {
        res.status(403).json({
          success: false,
          error: {
            code:
              "CANNOT_REMOVE_LAST_ADMIN",
            message:
              "The workspace must have at least one admin.",
          },
        });

        return;
      }

      console.error(
        "Removing workspace member failed:",
        error,
      );

      res.status(500).json({
        success: false,
        error: {
          code: "MEMBER_REMOVE_FAILED",
          message:
            "Unable to remove workspace member.",
        },
      });
    }
  };