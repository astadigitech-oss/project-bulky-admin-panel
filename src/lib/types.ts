export type BaseResponse = {
  message: string;
  status: boolean;
};

export type MetaPagination = {
  current_page: number;
  first_page: number;
  from: number;
  last: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type BaseParams = {
  id?: string;
};
