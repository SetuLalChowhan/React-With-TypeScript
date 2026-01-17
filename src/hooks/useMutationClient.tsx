/* eslint-disable react-hooks/rules-of-hooks */
import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "./useAxiosPublic";
import useAxiosSecure from "./useAxiosSecure";
import { useDispatch } from "react-redux";
import {
  setResetToken,
  setApiError as setUiApiError,
  setUser,
} from "@/redux/slices/uiSlice";
import { setToken} from "@/redux/slices/authSlice";
import { toast } from "react-toastify";
import { AxiosResponse, AxiosInstance } from "axios";

// --- Types ---
interface MutationParams {
  url: string;
  method?: "post" | "put" | "patch" | "delete";
  isPrivate?: boolean;
  invalidateKeys?: any[][];
  successMessage?: string;
  errorMessage?: string;
  redirectTo?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  isLogin?: boolean;
  resetFunction?: () => void;
  setImages?: (images: any[]) => void;
  externalErrorSetter?: (error: string[] | null) => void;
}

interface MutationData {
  data?: any;
  config?: any;
}

const useMutationClient = ({
  url,
  method = "post",
  isPrivate = false,
  invalidateKeys = [],
  successMessage = "Success",
  errorMessage,
  redirectTo,
  onSuccess,
  onError,
  isLogin = false,
  resetFunction,
  setImages,
  externalErrorSetter,
}: MutationParams): UseMutationResult<
  AxiosResponse<any>,
  any,
  MutationData
> => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const client: AxiosInstance = isPrivate ? useAxiosSecure() : useAxiosPublic();
  const navigate = useNavigate();

  const setApiError = (error: string[] | null) => {
    if (externalErrorSetter) {
      externalErrorSetter(error);
    } else {
      dispatch(setUiApiError(error));
    }
  };

  return useMutation({
    mutationFn: async ({ data, config }: MutationData) => {
      setApiError(null);
      if (method === "delete") {
        return await client.delete(url, config);
      }
      return await client[method](url, data, config);
    },

    onSuccess: (res) => {
      const data = res?.data || res;
      toast.success(data?.message || successMessage);

      // 🔐 Login handling
          if (isLogin) {
        const token = data.token || data.access_token;
        const user = data.userData || data.user;

        if (token) {
          dispatch(setToken(token));
        }
        if (user) {
          dispatch(setUser(user));
        }
      }

      // 🔑 Password reset handling
      if (data?.resetKey) {
        dispatch(setResetToken(data.resetKey));
      }

      // ♻️ Invalidate queries
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      if (redirectTo) navigate(redirectTo);

      setApiError(null);
      resetFunction?.();
      setImages?.([]);

      onSuccess?.(data);
    },

    onError: (error: any) => {
      const responseData = error?.response?.data;
      let messages: string[] = [];

      if (responseData?.errors) {
        messages = Object.values(responseData.errors).flat() as string[];
      } else {
        messages = [
          responseData?.message ||
            errorMessage ||
            error?.message ||
            "Something went wrong",
        ];
      }

      setApiError(messages);
      onError?.(error);
    },
  });
};

export default useMutationClient;
