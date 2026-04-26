/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

export const userDataContext = createContext();

const UserContext = ({ children }) => {
  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:10000";

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [frontendImage, setFrontendImage] = useState(
    () => localStorage.getItem("frontendImage") || null
  );
  const [backendImage, setBackendImage] = useState(
    () => localStorage.getItem("backendImage") || null
  );
  const [selectedImage, setSelectedImage] = useState(
    () => localStorage.getItem("selectedImage") || null
  );
  const [assistantName, setAssistantName] = useState(
    () => localStorage.getItem("assistantName") || ""
  );

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/current`, {
        withCredentials: true,
      });
      const user = result.data.user;
      setUserData(user);

      if (user.assistantName) {
        setAssistantName(user.assistantName);
        localStorage.setItem("assistantName", user.assistantName);
      }

      if (user.assistantImage) {
        setSelectedImage(user.assistantImage);
        localStorage.setItem("selectedImage", user.assistantImage);
      }
    } catch (error) {
      console.error("Error fetching current user data:", error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCurrentUser();

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const setFrontendImageWithStorage = (value) => {
    setFrontendImage(value);
    if (value) localStorage.setItem("frontendImage", value);
    else localStorage.removeItem("frontendImage");
  };

  const setSelectedImageWithStorage = (value) => {
    setSelectedImage(value);
    if (value) localStorage.setItem("selectedImage", value);
    else localStorage.removeItem("selectedImage");
  };

  const setAssistantNameWithStorage = (value) => {
    setAssistantName(value);
    if (value) localStorage.setItem("assistantName", value);
    else localStorage.removeItem("assistantName");
  };

  const value = {
    serverUrl,
    userData,
    setUserData,
    handleCurrentUser,
    loading,
    frontendImage,
    setFrontendImage: setFrontendImageWithStorage,
    backendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage: setSelectedImageWithStorage,
    assistantName,
    setAssistantName: setAssistantNameWithStorage,
  };

  return (
    <userDataContext.Provider value={value}>{children}</userDataContext.Provider>
  );
};

export default UserContext;
