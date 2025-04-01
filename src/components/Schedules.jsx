import React, { useState, useEffect } from "react";
import { useDesignerData } from "../contexts/DesignerDataContext";
import styles from "./Schedules.module.css";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiClock,
  FiMapPin,
  FiEdit,
  FiTrash2,
  FiEye,
  FiX,
  FiSave,
} from "react-icons/fi";
import api from "../services/api";

function Schedules({ username, role, userId }) {
  const { schedules, setSchedules, projects, clients } = useDesignerData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // 'month', 'week', or 'day'
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
    client_id: "",
    project_id: "",
    status: "scheduled",
    designer_id: userId,
  });

  // Fetch schedules on component mount
  useEffect(() => {
    const fetchDesignerSchedules = async () => {
      try {
        setLoading(true);

        if (userId && schedules.length === 0) {
          // Fetch data from the API only if context data is empty
          const data = await api.getUserData(userId, role);

          // Save data to context
          setSchedules(data.schedules);

          console.log("Fetched Schedules from API:", data.schedules);
        }
      } catch (error) {
        console.error("Error fetching data from API:", error);
      } finally {
        setLoading(false); // Ensure loading is set to false after fetching
      }
    };

    fetchDesignerSchedules();
  }, [userId, role, schedules, setSchedules]);

  // Handle input change for new schedule form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new schedule
  const handleAddSchedule = () => {
    // Validate form
    if (
      !newSchedule.title ||
      !newSchedule.start_time ||
      !newSchedule.end_time
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Create new schedule with a unique ID
    const scheduleToAdd = {
      ...newSchedule,
      id: `schedule_${Date.now()}`,
      designer_id: userId,
    };

    // Add to schedules state
    setSchedules((prev) => [...prev, scheduleToAdd]);

    // Close modal and reset form
    setShowAddModal(false);
    setNewSchedule({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location: "",
      client_id: "",
      project_id: "",
      status: "scheduled",
      designer_id: userId,
    });
  };

  // Helper function to format date (e.g., "March 2025")
  const formatMonthAndYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Helper function to format time (e.g., "9:00 AM")
  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Helper function to format date (e.g., "Mon, Mar 31")
  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Get client name from client ID
  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "N/A";
  };

  // Get project name from project ID
  const getProjectName = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "N/A";
  };

  // Calculate days for the current month view
  const getDaysInMonthGrid = () => {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();

    // Previous month days to display
    const previousMonthDays = [];
    const previousMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );
    const daysInPreviousMonth = previousMonth.getDate();

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      previousMonthDays.push({
        date: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          daysInPreviousMonth - i
        ),
        outsideMonth: true,
      });
    }

    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
        outsideMonth: false,
      });
    }

    // Next month days to display
    const nextMonthDays = [];
    const totalDaysDisplayed =
      previousMonthDays.length + currentMonthDays.length;
    const daysToAdd = 42 - totalDaysDisplayed; // 6 rows of 7 days

    for (let i = 1; i <= daysToAdd; i++) {
      nextMonthDays.push({
        date: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          i
        ),
        outsideMonth: true,
      });
    }

    return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Get events for a specific day
  const getEventsForDay = (date) => {
    return schedules.filter((event) => {
      const eventDate = new Date(event.start_time);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const days = getDaysInMonthGrid();
    const rows = [];
    const today = new Date();

    for (let i = 0; i < days.length; i += 7) {
      const week = days.slice(i, i + 7);
      rows.push(
        <tr key={i}>
          {week.map((day, index) => {
            const dayEvents = getEventsForDay(day.date);
            const isCurrentDay = isToday(day.date);

            return (
              <td
                key={index}
                className={`${day.outsideMonth ? styles.outsideMonth : ""} ${
                  isCurrentDay ? styles.today : ""
                }`}
              >
                <div className={styles.dayNumber}>{day.date.getDate()}</div>
                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={`${styles.calendarEvent} ${
                      styles[
                        `event${
                          event.status.charAt(0).toUpperCase() +
                          event.status.slice(1)
                        }`
                      ]
                    }`}
                    title={event.title}
                  >
                    {formatTime(event.start_time)} {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className={styles.moreEvents}>
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </td>
            );
          })}
        </tr>
      );
    }

    return rows;
  };

  // Add schedule modal
  const renderAddScheduleModal = () => {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h3>Add New Schedule</h3>
            <button
              className={styles.closeButton}
              onClick={() => setShowAddModal(false)}
            >
              <FiX />
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label>Title*</label>
              <input
                type="text"
                name="title"
                value={newSchedule.title}
                onChange={handleInputChange}
                placeholder="Meeting title"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                name="description"
                value={newSchedule.description}
                onChange={handleInputChange}
                placeholder="Add details about this meeting"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Start Time*</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={newSchedule.start_time}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>End Time*</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={newSchedule.end_time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={newSchedule.location}
                onChange={handleInputChange}
                placeholder="Meeting location"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Project</label>
                <select
                  name="project_id"
                  value={newSchedule.project_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name || project.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Client</label>
                <select
                  name="client_id"
                  value={newSchedule.client_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Status</label>
              <select
                name="status"
                value={newSchedule.status}
                onChange={handleInputChange}
              >
                <option value="scheduled">Scheduled</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button
              className={styles.cancelButton}
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button
              className={styles.saveButton}
              onClick={handleAddSchedule}
              disabled={
                !newSchedule.title ||
                !newSchedule.start_time ||
                !newSchedule.end_time
              }
            >
              <FiSave />
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className={styles.container}>Loading schedules...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Schedules</h2>
        <div className={styles.actions}>
          <button
            className={styles.addButton}
            onClick={() => setShowAddModal(true)}
          >
            <FiPlus /> Add Schedule
          </button>
        </div>
      </div>

      <div className={styles.calendarView}>
        <div className={styles.navigationHeader}>
          <div className={styles.navigationControls}>
            <button className={styles.navButton} onClick={goToPreviousMonth}>
              <FiChevronLeft />
            </button>
            <button className={styles.navButton} onClick={goToToday}>
              Today
            </button>
            <button className={styles.navButton} onClick={goToNextMonth}>
              <FiChevronRight />
            </button>
            <div className={styles.currentDate}>
              {formatMonthAndYear(currentDate)}
            </div>
          </div>
          <div className={styles.viewControls}>
            <button
              className={`${styles.viewButton} ${
                view === "month" ? styles.active : ""
              }`}
              onClick={() => setView("month")}
            >
              Month
            </button>
            <button
              className={`${styles.viewButton} ${
                view === "week" ? styles.active : ""
              }`}
              onClick={() => setView("week")}
            >
              Week
            </button>
            <button
              className={`${styles.viewButton} ${
                view === "day" ? styles.active : ""
              }`}
              onClick={() => setView("day")}
            >
              Day
            </button>
          </div>
        </div>

        <table className={styles.calendar}>
          <thead>
            <tr>
              <th>Sunday</th>
              <th>Monday</th>
              <th>Tuesday</th>
              <th>Wednesday</th>
              <th>Thursday</th>
              <th>Friday</th>
              <th>Saturday</th>
            </tr>
          </thead>
          <tbody>{renderCalendarDays()}</tbody>
        </table>
      </div>

      <div className={styles.eventsList}>
        <div className={styles.eventsHeader}>Upcoming Events</div>
        {schedules.length === 0 ? (
          <div className={styles.eventItem}>No scheduled events yet.</div>
        ) : (
          schedules
            .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
            .map((event, index) => (
              <div key={index} className={styles.eventItem}>
                <div
                  className={`${styles.eventColor} ${styles[event.status]}`}
                ></div>
                <div className={styles.eventDetails}>
                  <div className={styles.eventTitle}>{event.title}</div>
                  <div className={styles.eventInfo}>
                    <div className={styles.eventInfoItem}>
                      <FiClock />
                      {formatDate(event.start_time)} at{" "}
                      {formatTime(event.start_time)} -{" "}
                      {formatTime(event.end_time)}
                    </div>
                    <div className={styles.eventInfoItem}>
                      <FiMapPin />
                      {event.location || "No location specified"}
                    </div>
                  </div>
                </div>
                <div className={styles.eventActions}>
                  <button className={styles.actionButton} title="View">
                    <FiEye />
                  </button>
                  <button className={styles.actionButton} title="Edit">
                    <FiEdit />
                  </button>
                  <button className={styles.actionButton} title="Delete">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {showAddModal && renderAddScheduleModal()}
    </div>
  );
}

export default Schedules;
