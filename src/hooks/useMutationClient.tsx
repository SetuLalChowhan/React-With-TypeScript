import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigation, useNavigate } from "react-router-dom";
import useAxiosPublic from "./useAxiosPublic";
import useAxiosSecure from "./useAxiosSecure";
import { useAuthStore } from "@/providers/useAuthStore";
import { useValueStore } from "@/providers/useState";

type Method = "post" | "put" | "delete" | "patch";

type MutationOptions = {
  url: string;
  method?: Method;
  isPrivate?: boolean;
  invalidateKeys?: string[][];
  successMessage?: string;
  redirectTo?: string;
  isLogin?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
};

const useMutationClient = ({
  url,
  method = "post",
  isPrivate = false,
  invalidateKeys = [],
  successMessage = "Success",
  redirectTo,
  isLogin = false,
  onSuccess,
  onError,
}: MutationOptions) => {
  const queryClient = useQueryClient();
  const client = isPrivate ? useAxiosSecure() : useAxiosPublic();
  const navigate = useNavigate();
  const { saveAuthData } = useAuthStore();
  const {setResetToken} =useValueStore()

  const mutation = useMutation({
    mutationFn: async (payload?: any) => {
      if (method === "delete") {
        return client.delete(url);
      }
      return client[method](url, payload);
    },

    onSuccess: (res: any) => {
      const data = res?.data;

      toast.success(data?.message || successMessage);

      if (isLogin && data?.user) {
        saveAuthData(data?.accessToken, data?.user);
      }

      if (data?.resetKey) {
        setResetToken(data.resetKey);
      }

      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      );

      if (redirectTo) navigate(redirectTo);

      onSuccess?.(data);
    },

    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong";

      toast.error(message);
      onError?.(error);
    },
  });

  return mutation;
};

export default useMutationClient;
// const login = useMutationClient({
//   url: "/auth/login",
//   isLogin: true,
//   redirectTo: "/dashboard",
// });

// login.mutate({
//   email: "test@gmail.com",
//   password: "123456",
// });