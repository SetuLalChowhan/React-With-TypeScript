import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure"

export const useCourseDataHook = (search = '', sort = 'newest') => {
    const axiosSecure = useAxiosSecure();
    return useQuery({
        queryKey: ['courseData', search, sort],
        queryFn: async () => {
            const res = await axiosSecure.get(`/my-courses?search=${search}&sort=${sort}`);
            return res?.data?.data;
        }
    })
}