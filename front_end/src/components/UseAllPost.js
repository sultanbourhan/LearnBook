import { useQuery } from "@tanstack/react-query";
import { fetchAllPost } from "./API";
import { useUser } from './Context';
export const useAllPost = () => {
  const { type_post } = useUser();
  const { type_post_role } = useUser();
  return useQuery({
    queryKey: ["AllPost", type_post, type_post_role],
    queryFn: () => fetchAllPost({ type_post, type_post_role }),
    staleTime: 1000 * 60 * 5, // الكاش يبقى 5 دقايق


  });
};