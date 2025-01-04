import React, { useState, useEffect } from "react";
import ChatRoom from "../components/chatroom/ChatRoom";
import AddGroup from "../components/chatroom/AddGroup";
import talko from "../../src/components/image/talko.webp";
import { Box, useMediaQuery, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Layout() {
  const isMobileView = useMediaQuery("(max-width:768px)");
  const [selectedUser, setSelectedUser] = useState(
    JSON.parse(localStorage.getItem("selectedUser")) || null
  );
  const [isChatOpen, setIsChatOpen] = useState(false);

  const navigate = useNavigate();
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    localStorage.setItem("selectedUser", JSON.stringify(user));
    if (isMobileView) {
      setIsChatOpen(true);
    }
  };

  const handleBackToList = () => {
    setIsChatOpen(false);
    setSelectedUser(null);
    localStorage.removeItem("selectedUser");
  };
  // Preserve the selected user state on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("selectedUser");
    if (storedUser) {
      setSelectedUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobileView ? "column" : "row",
        height: "100vh",
        width: "100vw",
      }}
    >
      {/* Left Sidebar / AddGroup - Only show if NOT in mobile chat view */}
      {!(isMobileView && isChatOpen) && ( // Key change here
        <Box
          sx={{
            width: isMobileView ? "100%" : "25%",
            backgroundColor: "#1976d2",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AddGroup setSelectedUser={handleUserSelect} />
        </Box>
      )}

      {/* Right Chat Section - Only show if a user is selected */}
      {selectedUser && (
        <Box
          sx={{
            width: isMobileView ? "100%" : "75%",
            backgroundColor: "#f5f5f5",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {isMobileView && isChatOpen && (
            <Button
              onClick={handleBackToList}
              sx={{
                alignSelf: "flex-start",
                m: 1,
                backgroundColor: "#1976d2",
                color: "#fff",
                "&:hover": { backgroundColor: "#1565c0" },
              }}
            >
              Back to List
            </Button>
          )}
          <ChatRoom
            recipientId={selectedUser.userId}
            userName={selectedUser.userName}
          />
        </Box>
      )}

      {/* Placeholder Image - Only show if NO user is selected AND we are NOT in mobile chat view*/}
      {!selectedUser && !(isMobileView && isChatOpen) && (
        <Box
          sx={{
            width: isMobileView ? "100%" : "75%",
            backgroundColor: "#f5f5f5",
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src={talko}
            alt="Talko"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export default Layout;
