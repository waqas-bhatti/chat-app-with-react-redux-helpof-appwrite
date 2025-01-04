import { configureStore } from "@reduxjs/toolkit";
import ChatSlice from "./ChatSlice.jsx";

const store = configureStore({
  reducer: {
    chat: ChatSlice,
  },
});

export default store;
