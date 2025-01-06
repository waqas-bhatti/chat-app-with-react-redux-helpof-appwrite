import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import appwriteService from "../../apwriteService/appwriteService";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { deleteChat, editChat } from "../../ReduxStore/ChatSlice";
import { useNavigate } from "react-router-dom";

function ChatRoom({ recipientId, userName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [users, setUsers] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState("");
  const user = useSelector((state) => state.chat.user);
  const dispatch = useDispatch();
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(0);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // handle the image
  const handleChangeImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const ImageUrl = URL.createObjectURL(file);
      setImagePreview(ImageUrl);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Request Notification Permission
  useEffect(() => {
    const handleNotificationRequest = async () => {
      if ("Notification" in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            console.log("Notification permission granted.");
            // Optionally, show a notification
            new Notification("You have enabled notifications!");
          } else {
            console.log("Notification permission denied.");
          }
        } catch (error) {
          console.error("Error requesting notification permission:", error);
        }
      } else {
        console.log("Notifications are not supported by this browser.");
      }
    };
    handleNotificationRequest();
  }, []);
  // Fetch Messages and Map User Data
  const fetchData = async () => {
    try {
      const fetchedMessages = await appwriteService.getMessages(
        user.$id,
        recipientId
      );

      if (fetchedMessages.length > 0) {
        const lastMessage = fetchedMessages[fetchedMessages.length - 1];
        if (
          lastMessage.userId !== user.$id &&
          lastMessage.timestamp > lastMessageTimestamp
        ) {
          showNotification(lastMessage);
          setLastMessageTimestamp(lastMessage.timestamp);
        }
      }
      setMessages(fetchedMessages);

      const userList = await appwriteService.fetchAllUser();
      const userMap = userList.reduce(
        (map, u) => ({ ...map, [u.userId]: u.userName }),
        {}
      );
      setUsers(userMap);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [user.$id, recipientId, lastMessageTimestamp]);

  const showNotification = (message) => {
    if (Notification.permission === "granted") {
      const senderName = users[message.userId] || "Unknown User";
      new Notification("New Message", {
        body: `${senderName}: ${message.messagechat}`,
      });
    }
    toast.info(`New message from ${users[message.userId] || "Unknown User"}`);
  };

  const handleSend = async () => {
    if (!newMessage.trim() && !image) return;

    let featuredImage = null;
    if (image) {
      const fileId = await appwriteService.uploadImge(image);
      featuredImage = await appwriteService.getFilePreview(fileId);
    }

    try {
      await appwriteService.createMessage(
        user.$id,
        recipientId,
        newMessage,
        featuredImage
      );

      setNewMessage("");
      setImage(null);
      setImagePreview(null);
      fetchData();

      // Move yourself to the top in the recipient's list
      const updatedUsers = [...users];
      const senderIndex = updatedUsers.findIndex((u) => u.$id === user.$id);
      const [movedUser] = updatedUsers.splice(senderIndex, 1);
      updatedUsers.unshift(movedUser);
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const formatTimeStamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const handleRemoveMessage = async (documentId) => {
    try {
      // Use only documentId for deletion
      await appwriteService.deleteMessage(documentId);

      // Update UI immediately by filtering out deleted message
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.$id !== documentId)
      );

      // Dispatch Redux action to update state
      dispatch(deleteChat(documentId));

      toast.success("Message deleted successfully!");
    } catch (error) {
      console.error("Failed to delete the message:", error);
      toast.error("Failed to delete the message.");
    }
  };

  const handleEditMessage = (message) => {
    setEditMode(true);
    setEditText(message.messagechat);
    setNewMessage(message.messagechat);
    setSelectedMessage(message);
  };

  const saveEditMessage = async () => {
    if (!editText.trim()) return;
    try {
      const updatedMessage = await appwriteService.updateMessage(
        selectedMessage.$id,
        editText
      );
      dispatch(
        editChat({
          id: selectedMessage.$id,
          updateMessage: editText,
        })
      );

      setMessages((prevMessage) =>
        prevMessage.map((msg) =>
          msg.$id === selectedMessage.$id
            ? { ...msg, messagechat: editText }
            : msg
        )
      );
      toast.success("Message updated successfully!");
      setEditMode(false);
      setEditText("");
      setNewMessage("");
      setSelectedMessage(null);
    } catch (error) {
      console.error("Failed to update the message:", error);
      toast.error("Failed to update the message.");
    }
  };

  const handleClick = (event, message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  // Handle Menu Close
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Chat Header */}
      <Box
        sx={{
          backgroundColor: "#2196f3",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6">Chat Room</Typography>
      </Box>
      <Typography variant="h5" sx={{ textAlign: "center", mt: 2 }}>
        Chat With {userName}
      </Typography>

      {/* Messages Display */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          backgroundColor: "#f9f9f9",
          maxHeight: isMobile ? "calc(100vh - 250px)" : "calc(100vh - 150px)",
        }}
      >
        <ToastContainer />
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              flexDirection: msg.userId === user.$id ? "row-reverse" : "row",
            }}
          >
            {/* Avatar */}
            <Avatar>
              {msg.userId === user.$id
                ? "You"
                : users[msg.userId]?.charAt(0).toUpperCase() || "?"}
            </Avatar>

            {/* Message Content */}
            <Box
              sx={{
                backgroundColor:
                  msg.userId === user.$id ? "#2196f3" : "#e0e0e0",
                color: msg.userId === user.$id ? "#fff" : "#000",
                p: 2,
                borderRadius: "12px",
                maxWidth: "60%",
                wordWrap: "break-word",
              }}
            >
              {/* Display Image if exists */}
              {msg.featuredImage && (
                <img
                  src={msg.featuredImage}
                  alt="Uploaded"
                  style={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    marginBottom: "8px",
                  }}
                />
              )}
              {/* Display Message */}
              <Typography>
                {msg.messagechat}
                <div>
                  <small>{formatTimeStamp(msg.timestamp)}</small>
                </div>
              </Typography>
            </Box>

            {msg.userId === user.$id && (
              <div onClick={(e) => handleClick(e, msg)}>
                <MoreVertIcon />
              </div>
            )}
          </Box>
        ))}
      </Box>
      {/* Options Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleEditMessage(selectedMessage)}>
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleRemoveMessage(selectedMessage.$id)}>
          Delete
        </MenuItem>
      </Menu>
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          p: 2,
          display: "flex",
          gap: 1,
          backgroundColor: "#fff",
          borderTop: "1px solid #ddd",
        }}
      >
        <TextField
          fullWidth
          placeholder={editMode ? "Edit your message..." : "Type a message..."}
          value={editMode ? editText : newMessage}
          onChange={(e) =>
            editMode
              ? setEditText(e.target.value)
              : setNewMessage(e.target.value)
          }
        />

        <input
          type="file"
          style={{ display: "none" }}
          id="file-input"
          onChange={handleChangeImage}
        />
        <label htmlFor="file-input">
          <BrokenImageIcon sx={{ fontSize: 40, cursor: "pointer" }} />
        </label>
        {imagePreview && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img src={imagePreview} alt="preview" style={{ width: "150px" }} />
            <IconButton onClick={handleRemoveImage}>
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        <SendIcon
          variant="contained"
          sx={{ fontSize: 50, color: "green", cursor: "pointer" }}
          onClick={editMode ? saveEditMessage : handleSend}
        >
          {editMode ? "Update" : "Send"}
        </SendIcon>
        {editMode && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setEditMode(false);
              setEditText("");
              setNewMessage("");
              setSelectedMessage(null);
            }}
          >
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default ChatRoom;
