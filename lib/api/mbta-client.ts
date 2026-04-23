import axios from 'axios';

const mbtaApiKey = process.env.EXPO_PUBLIC_MBTA_API_KEY;

export const mbtaClient = axios.create({
  baseURL: 'https://api-v3.mbta.com',
  headers: {
    Accept: 'application/vnd.api+json',
    'Accept-Encoding': 'gzip',
    ...(mbtaApiKey ? { 'x-api-key': mbtaApiKey } : {}),
  },
  timeout: 10000,
});
