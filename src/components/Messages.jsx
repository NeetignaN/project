import React, { useState, useEffect } from "react";
import {
  FiFilter,
  FiSearch,
  FiClock,
  FiPaperclip,
  FiMessageSquare,
} from "react-icons/fi";
import api from "../services/api.js";
import styles from "./Messages.module.css";

function Messages({ username, role, userId }) {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, projects, clients
  const [filterValue, setFilterValue] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch conversations
        const userData = await api.getUserData(userId, role);
        const allConversations = userData.messages;

        // Fetch related data
        const allProjects = await api.getData("projects");
        const allClients = await api.getData("clients");
        const allDesigners = await api.getData("designers");

        setConversations(allConversations);
        setFilteredConversations(allConversations);
        setProjects(allProjects);
        setClients(allClients);
        setDesigners(allDesigners);

        // Set the first conversation as active if available
        if (allConversations.length > 0) {
          setActiveConversation(allConversations[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [userId, role]);
  //   console.log(conversations);

  // Apply filters when filter type or value changes
  useEffect(() => {
    filterConversations();
  }, [filterType, filterValue, searchTerm, conversations]);

  // Handle filtering conversations
  const filterConversations = () => {
    let filtered = [...conversations];

    // Apply search term filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((conv) => {
        const participantMatches = conv.participants.some((participantId) => {
          const client = clients.find((c) => c.id === participantId);
          const designer = designers.find((d) => d.id === participantId);

          if (client) {
            return client.name.toLowerCase().includes(searchTerm.toLowerCase());
          }
          if (designer) {
            return designer.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          }
          return false;
        });

        const contentMatches = conv.messages.some((msg) =>
          msg.content.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return participantMatches || contentMatches;
      });
    }

    // Apply type filter
    if (filterType === "projects" && filterValue !== "all") {
      filtered = filtered.filter((conv) => conv.project_id === filterValue);
    } else if (filterType === "clients" && filterValue !== "all") {
      filtered = filtered.filter((conv) =>
        conv.participants.includes(filterValue)
      );
    }

    setFilteredConversations(filtered);
  };

  // Get the participant name
  const getParticipantName = (participantId) => {
    if (participantId === userId) return "You";

    const client = clients.find((c) => c.id === participantId);
    if (client) return client.name;

    const designer = designers.find((d) => d.id === participantId);
    if (designer) return designer.name;

    return "Unknown User";
  };

  // Get the project name
  const getProjectName = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.title : "No Project";
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // Today - show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    // This week - show day name
    else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    // Older - show date
    else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Handle selecting a conversation
  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
  };

  // Handle filter type change
  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setFilterValue("all");
  };

  // Handle filter value change
  const handleFilterValueChange = (e) => {
    setFilterValue(e.target.value);
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading messages...</div>;
  }

  return (
    <div className={styles.messagesContainer}>
      <h1 className={styles.pageTitle}>Messages</h1>

      <div className={styles.messagesLayout}>
        {/* Sidebar with conversation list */}
        <div className={styles.conversationsSidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.searchContainer}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filtersContainer}>
              <div className={styles.filterTypeContainer}>
                <label htmlFor="filterType" className={styles.filterLabel}>
                  <FiFilter /> Filter by:
                </label>
                <select
                  id="filterType"
                  value={filterType}
                  onChange={handleFilterTypeChange}
                  className={styles.filterSelect}
                >
                  <option value="all">All Messages</option>
                  <option value="projects">By Project</option>
                  <option value="clients">By Client</option>
                </select>
              </div>

              {filterType !== "all" && (
                <div className={styles.filterValueContainer}>
                  <select
                    value={filterValue}
                    onChange={handleFilterValueChange}
                    className={styles.filterSelect}
                  >
                    <option value="all">All {filterType}</option>
                    {filterType === "projects" &&
                      projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    {filterType === "clients" &&
                      clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className={styles.conversationsList}>
            {filteredConversations.length === 0 ? (
              <div className={styles.noResults}>No conversations found</div>
            ) : (
              filteredConversations.map((conversation) => {
                const lastMessage =
                  conversation.messages[conversation.messages.length - 1];
                const otherParticipants = conversation.participants.filter(
                  (p) => p !== userId
                );
                const primaryParticipant = otherParticipants[0];

                return (
                  <div
                    key={conversation.id}
                    className={`${styles.conversationItem} ${
                      activeConversation?.id === conversation.id
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className={styles.participantInfo}>
                      <div className={styles.participantAvatar}>
                        {getParticipantName(primaryParticipant).charAt(0)}
                      </div>
                      <div className={styles.participantDetails}>
                        <div className={styles.participantName}>
                          {getParticipantName(primaryParticipant)}
                        </div>
                        <div className={styles.projectName}>
                          {getProjectName(conversation.project_id)}
                        </div>
                      </div>
                      <div className={styles.messageTime}>
                        {formatDate(lastMessage.timestamp)}
                      </div>
                    </div>
                    <div className={styles.messagePreview}>
                      {lastMessage.content.length > 60
                        ? `${lastMessage.content.substring(0, 60)}...`
                        : lastMessage.content}
                    </div>
                    {lastMessage.attachments.length > 0 && (
                      <div className={styles.attachmentIndicator}>
                        <FiPaperclip /> {lastMessage.attachments.length}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main conversation area */}
        <div className={styles.conversationMain}>
          {activeConversation ? (
            <>
              <div className={styles.conversationHeader}>
                <div className={styles.conversationInfo}>
                  <h2 className={styles.conversationTitle}>
                    {activeConversation.participants
                      .filter((p) => p !== userId)
                      .map((p) => getParticipantName(p))
                      .join(", ")}
                  </h2>
                  <div className={styles.conversationSubtitle}>
                    {getProjectName(activeConversation.project_id)}
                  </div>
                </div>
              </div>

              <div className={styles.messagesArea}>
                {activeConversation.messages.map((message) => {
                  const isSender = message.sender === userId;

                  return (
                    <div
                      key={message.id}
                      className={`${styles.messageItem} ${
                        isSender ? styles.sentMessage : styles.receivedMessage
                      }`}
                    >
                      {!isSender && (
                        <div className={styles.messageAvatar}>
                          {getParticipantName(message.sender).charAt(0)}
                        </div>
                      )}

                      <div className={styles.messageContent}>
                        {!isSender && (
                          <div className={styles.messageSender}>
                            {getParticipantName(message.sender)}
                          </div>
                        )}
                        <div className={styles.messageText}>
                          {message.content}
                        </div>
                        <div className={styles.messageTimestamp}>
                          <FiClock size={12} /> {formatDate(message.timestamp)}
                        </div>

                        {message.attachments.length > 0 && (
                          <div className={styles.messageAttachments}>
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className={styles.attachment}>
                                <FiPaperclip /> Attachment {index + 1}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.messageComposer}>
                <textarea
                  placeholder="Type a message..."
                  className={styles.messageInput}
                />
                <div className={styles.messageActions}>
                  <button className={styles.attachButton}>
                    <FiPaperclip />
                  </button>
                  <button className={styles.sendButton}>Send</button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.noConversationSelected}>
              <div className={styles.noConversationMessage}>
                <FiMessageSquare size={48} />
                <h3>No conversation selected</h3>
                <p>Select a conversation from the sidebar to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
