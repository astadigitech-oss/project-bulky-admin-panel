import { useApiQuery } from "@/lib/query/use-query";

export type Data = {
  email: string;
  id: string;
  nama: string;
  permissions: string[];
  role: { nama: string };
};

type Response = {
  data: Data;
  success: boolean;
};

export const useMe = () => {
  const query = useApiQuery<Response>({
    key: ["me"],
    endpoint: `/auth/me`,
  });
  return query;
};
