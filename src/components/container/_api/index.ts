import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIMe } from "./data";
import { useMutate } from "@/lib/query";

// query
export const useMe = () => useApiQuery(dataAPIMe.query().me);

// mutation
export const useLogout = () => useMutate(dataAPIMe.mutation().logout);
