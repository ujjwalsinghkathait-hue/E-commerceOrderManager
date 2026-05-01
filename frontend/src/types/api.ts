/** Matches backend JSON shape `{ success, message?, data? }`. */
export type ApiSuccessResponse<T> = {
  success: true;
  message?: string;
  data?: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  stack?: string;
};
