import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chat: [],
  isAuthenticated: false,
  user: null,
};

const isValidJson = (str) => {
  if (!str) return false; // Check for null or undefined
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
};

const getStoredAuthData = () => {
  try {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const storedUser = localStorage.getItem("user");
    const user =
      storedUser && isValidJson(storedUser) ? JSON.parse(storedUser) : null;
    return { isAuthenticated, user };
  } catch (error) {
    console.log("Failed to retrieve user data from localStorage", error);
    return { isAuthenticated: false, user: null };
  }
};

const storedState = getStoredAuthData();
const mergedState = {
  ...initialState,
  ...storedState, // Stored state has priority
};

const chatSlice = createSlice({
  name: "userChat",
  initialState: mergedState,
  reducers: {
    create: (state, action) => {
      state.chat.push(action.payload);
    },
    deleteChat: (state, action) => {
      state.chat = state.chat.filter((post) => post.id !== action.payload);
    },
    editChat: (state, action) => {
      const { id, updateMessage } = action.payload;
      const chatIndex = state.chat.findIndex((chat) => chat.id === id);
      if (id && chatIndex !== -1) {
        state.chat[chatIndex] = {
          ...state.chat[chatIndex],
          message: updateMessage,
        };
      }
    },
    userLogin: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      // Persist state to localStorage
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    userLogout: (state) => {
      state.isAuthenticated = false;
      state.user = null; // Clear user info
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
    },
  },
});

export const { create, deleteChat, editChat, userLogin, userLogout } =
  chatSlice.actions;
export default chatSlice.reducer;
