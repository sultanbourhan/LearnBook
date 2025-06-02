import { useQuery } from "@tanstack/react-query";
import { fetchAllUsers } from "./API";

export const useAllUsers = () => {
  return useQuery({
    queryKey: ["AllUser"],
    queryFn: fetchAllUsers,
    staleTime: 1000 * 60 * 5, // الكاش يبقى 5 دقايق
  });
};