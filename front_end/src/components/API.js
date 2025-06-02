// api.js
import axios from 'axios';
import Cookies from 'js-cookie';

export const fetchMyData = async () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = Cookies.get('token');
  const response = await axios.get(
    `${apiUrl}/api/v2/auth/get_date_my`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data;
};
export const fetchAllUsers = async () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = Cookies.get('token');
  const response = await axios.get(
    `${apiUrl}/api/v2/user`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data;
};


export const fetchAllPost = async ({ type_post, type_post_role }={}) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = Cookies.get('token');
  const response = await axios.get(
    `${apiUrl}/api/v2/post?type=${type_post}&role=${type_post_role}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data;
};
