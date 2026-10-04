export type Label = {
  id: string;
  projectId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type LabelsResponse = {
  success: boolean;
  data: Label[];
};

export type LabelResponse = {
  success: boolean;
  data: Label;
};

export type CreateLabelInput = {
  name: string;
  color: string;
};

export type UpdateLabelInput = {
  name?: string;
  color?: string;
};

export type DeleteLabelResponse = {
  success: boolean;
  message: string;
};