import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import authService from "../../apwriteService/auth";
import { userLogin } from "../../ReduxStore/ChatSlice";

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.chat.user); // Redux user state
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if user session exists
        const sessionUser = await authService.getCurrentUser();
        if (sessionUser) {
          dispatch(userLogin({ user: sessionUser })); // Update Redux
        }
      } catch (error) {
        console.error("Session validation failed:", error.message);
      } finally {
        setIsLoading(false); // Stop loading after session check
      }
    };

    // Check session if no user is in Redux state
    if (!user) {
      checkSession();
    } else {
      setIsLoading(false);
    }
  }, [dispatch, user]);

  // Show loading spinner while validating session
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if no user
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
