import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  MetaPagination,
} from "@/lib/types";

// types
// ------partials------
export type FAQsType = {
  created_at: string;
  id: string;
  is_active: boolean;
  question: string;
  question_en: string;
  updated_at: string;
  urutan: number;
  answer: string;
  answer_en: string;
};

export type FAQsListRequest = BaseListParams;

export type FAQsDetailRequest = BaseParams;

// ------query------
export type FAQsListResponse = BaseResponse & {
  data: FAQsType[];
  meta: MetaPagination;
};

export type FAQsDetailResponse = BaseResponse & {
  data: FAQsType;
};

// ------mutation------
export type CreateFAQsBody = {
  answer: string;
  answer_en: string;
  question: string;
  question_en: string;
};

export type CreateFAQsResponse = BaseResponse & {
  data: FAQsType;
};

export type UpdateFAQsParams = BaseParams;

export type UpdateFAQsBody = {
  answer: string;
  answer_en: string;
  question: string;
  question_en: string;
};

export type UpdateFAQsResponse = BaseResponse & {
  data: FAQsType;
};

export type DeleteFAQsParams = BaseParams;

export type DeleteFAQsResponse = BaseResponse;

export type ChangeStatusFAQsParams = BaseParams;

export type ChangeStatusFAQsResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};
export type ReorderFAQsParams = BaseParams;

export type ReorderFAQsBody = { direction: "up" | "down" };

export type ReorderFAQsResponse = BaseResponse & {
  data: {
    item: { id: string; urutan: number };
    swapped_with: { id: string; urutan: number };
  };
};
