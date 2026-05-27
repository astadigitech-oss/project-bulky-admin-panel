import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";

import { isRecord } from "./utils";

import { errorResponse } from "./error-response";
import { UseMutateConfig, MutationVariables } from "./types";
import { apiUrl, cookiesKey } from "@/config";
import { getCookie } from "cookies-next/client";

export const useMutate = <
  TResponse = any,
  TBody = undefined,
  TParams = undefined,
  TSearchParams = undefined,
>({
  endpoint,
  method,
  onSuccess,
  onError,
  errorCustom,
  isPublic = false,
}: UseMutateConfig<TResponse, TBody, TParams, TSearchParams>) =>
  useMutation<
    AxiosResponse<TResponse>,
    AxiosError,
    MutationVariables<TBody, TParams, TSearchParams>
  >({
    mutationFn: async (variables) => {
      let url = apiUrl + endpoint;

      if (
        variables &&
        "params" in variables &&
        variables.params !== undefined &&
        isRecord(variables.params)
      ) {
        Object.entries(variables.params).forEach(([key, val]) => {
          url = url.replace(`:${key}`, encodeURIComponent(val));
        });
      }

      if (
        variables &&
        "searchParams" in variables &&
        variables.searchParams !== undefined
      ) {
        const query = new URLSearchParams(
          variables.searchParams as any,
        ).toString();
        url += url.includes("?") ? `&${query}` : `?${query}`;
      }

      const body =
        variables && "body" in variables && variables.body !== undefined
          ? variables.body
          : {};

      const axiosConfig = {
        headers: !isPublic
          ? { Authorization: `Bearer ${getCookie(cookiesKey)}` }
          : {},
      };

      switch (method) {
        case "get":
          return axios.get(url, axiosConfig);
        case "post":
          return axios.post(url, body, axiosConfig);
        case "put":
          return axios.put(url, body, axiosConfig);
        case "delete":
          return axios.delete(url, axiosConfig);
        default:
          return axios.patch(url, body, axiosConfig);
      }
    },
    onSuccess: async (data, variables, context) => {
      if (onSuccess) await onSuccess(data, variables, context);
    },
    onError: (err, v, c) => {
      if (errorCustom) {
        errorCustom(err, v, c);
      } else {
        errorResponse({
          err,
          title: onError?.title,
        });
      }
    },
  });
