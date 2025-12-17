import axios, { AxiosHeaders } from "axios";

const useAxiosSecure = () => {
  const access_token = localStorage.getItem("access_token"); // ✅ get token

  const axiosSecure = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 30000,
  });

  axiosSecure.interceptors.request.use((config) => {
    if (access_token) {
      // ✅ Type-safe headers assignment
      config.headers = new AxiosHeaders({
        ...config.headers,
        Authorization: `Bearer ${access_token}`,
      });
    }
    return config;
  });

  return axiosSecure;
};

export default useAxiosSecure;
