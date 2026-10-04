export type ActivityUser = {
  id: string;
  name: string;
  email: string;
};

export type ActivityMetadata = Record<string, unknown>;

export type ActivityItem = {
  id: string;
  workspaceId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: ActivityMetadata;
  createdAt: string;
  user?: ActivityUser | null;
};

export type ActivityFilters = {
  action?: string;
  entityType?: string;
  limit?: number;
  cursor?: string;
};

export type ActivityPagination = {
  limit: number;
  hasNextPage: boolean;
  nextCursor: string | null;
};

export type ActivityResponse = {
  success: boolean;
  data: ActivityItem[];
  pagination: ActivityPagination;
  filters: {
    action: string | null;
    entityType: string | null;
  };
};