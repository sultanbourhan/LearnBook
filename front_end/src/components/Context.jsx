import React, { createContext, useState, useContext , useEffect} from 'react';
import axios from 'axios';
import { useCookies } from "react-cookie";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {

  const apiUrl = import.meta.env.VITE_API_URL;

  const [userId, setUserId] = useState(null); // لتخزين معرف المستخدم
  const [userById, setUserById] = useState(null); // بيانات المستخدم عبر المعرف
  const [showChat, setShowChat] = useState(false); // إظهار أو إخفاء الدردشة
  const [userTheme, setUserTheme] = useState('light'); // الثيم الخاص بالمستخدم
  const [notifications, setNotifications] = useState([]); // الإشعارات للمستخدم
  const [type_post, setType_post] = useState(""); // الإشعارات للمستخدم
  const [type_post_role, setType_post_role] = useState(""); 
  
 const [cookies, setCookies] = useCookies(["token"]);

    const [MyData, setMyData] = useState(null);
    const [friendRequests, setFriendRequests] = useState([]);
const [messages, setMessages] = useState([]);
  useEffect(() => {
    axios.get(`${apiUrl}/api/v2/auth/get_date_my`, {
      headers: {
        Authorization: `Bearer ${cookies.token}`,
      },
    })
      .then(res => {
        setMyData(res.data.data);
        setFriendRequests(res.data.data.FriendRequests)
        setMessages(res.data.data.Messages)
        
      })
      .catch(error => {
        console.error('Error fetching data', error);
      });
  }, []);
  return (
    <UserContext.Provider value={{ 
      userId, setUserId, 
      userById, setUserById, 
      showChat, setShowChat,
      userTheme, setUserTheme, 
      notifications, setNotifications ,
      type_post, setType_post,
      type_post_role, setType_post_role,
      MyData, setMyData
    }}>
      {children}
    </UserContext.Provider>
  );
};
