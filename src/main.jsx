import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ChatRoom from "./components/chatroom/ChatRoom.jsx";
import { Container } from "@mui/material";
import Layout from "./Layout/Layout.jsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Login from "./components/AuthForm/Login.jsx";
import store from "./ReduxStore/store.js";
import SignUp from "./components/AuthForm/SignUp.jsx";
import { RouterProvider } from "react-router-dom";
import AuthLayout from "./Layout/AuthLayout.jsx";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute.jsx";
import { Provider } from "react-redux";
import AddGroup from "./components/chatroom/AddGroup.jsx";
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Main Layout with Nested Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ChatRoom />} />
        <Route path="/add-group" element={<AddGroup />} />
        <Route path="/chatroom" element={<ChatRoom />} />
      </Route>

      {/* Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
      </Route>
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
