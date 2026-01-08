import { useMutate } from "@/lib/query";
import { dataAPILogin } from "./data";
import { useQueryClient } from "@tanstack/react-query";

// mutation
export const useLogin = () =>
  useMutate(dataAPILogin.mutation(useQueryClient()).login);
