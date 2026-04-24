




import axios, { AxiosError, type AxiosInstance } from 'axios';

const MBTA_BASE_URL = 'https://api-v3.mbta.com';



const MBTA_API_KEY: string | undefined = undefined;




export const mbtaClient: AxiosInstance = axios.create({
  baseURL: MBTA_BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/vnd.api+json',
    'Accept-Encoding': 'gzip',
    ...(MBTA_API_KEY ? { 'x-api-key': MBTA_API_KEY } : {})
  }
});



mbtaClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 429) {
        return Promise.reject(
          new MbtaApiError('Rate limit exceeded. Please wait a moment and try again.', status)
        );
      }
      if (status >= 500) {
        return Promise.reject(
          new MbtaApiError('MBTA Server Offline — please try again shortly.', status)
        );
      }
      if (status === 404) {
        return Promise.reject(
          new MbtaApiError('Vehicle or route not found.', status)
        );
      }
      return Promise.reject(
        new MbtaApiError(`Request failed (${status})`, status)
      );
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(
        new MbtaApiError('Request timed out — check your connection.', 0)
      );
    }

    return Promise.reject(
      new MbtaApiError('Network error — please check your internet connection.', 0)
    );
  }
);




export class MbtaApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'MbtaApiError';
    this.status = status;
  }
}