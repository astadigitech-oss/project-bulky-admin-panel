import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  DuoLangType,
  MetaPagination,
} from "@/lib/types";

// types
// ------partials------
export type HeroPartIType = {
  gambar_url: DuoLangType;
  id: string;
  is_default: boolean;
  is_visible: boolean;
  nama: string;
  updated_at: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
};
export type HeroPartIIType = {
  created_at: string;
};

export type HeroListRequest = BaseListParams;

export type HeroDetailRequest = BaseParams;

// ------query------
export type HeroListResponse = BaseResponse & {
  data: HeroPartIType[];
  meta: MetaPagination;
};

export type HeroDetailResponse = BaseResponse & {
  data: HeroPartIType & HeroPartIIType;
};

// ------mutation------
export type CreateHeroBody = FormData;

export type CreateHeroResponse = BaseResponse & {
  data: HeroPartIType & HeroPartIIType;
};

export type UpdateHeroParams = BaseParams;

export type UpdateHeroBody = FormData;

export type UpdateHeroResponse = BaseResponse & {
  data: HeroPartIType & HeroPartIIType;
};

export type DeleteHeroParams = BaseParams;

export type DeleteHeroResponse = BaseResponse;

export type ChangeStatusHeroParams = BaseParams;

export type ChangeStatusHeroResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};
