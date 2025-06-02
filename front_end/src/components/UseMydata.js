// hooks/useMyData.js
import { useQuery } from "@tanstack/react-query";
import { fetchMyData } from "./API";

export const useMyData = () => {
  return useQuery({
    queryKey: ["myData"],
    queryFn: fetchMyData,
    staleTime: 1000 * 10, // الكاش يبقى 10 ثواني

  });
};
