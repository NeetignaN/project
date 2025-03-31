import React, { useState, useEffect } from "react";
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
  FiCheck,
  FiCalendar,
  FiUsers,
  FiFolder,
} from "react-icons/fi";
import api from "../services/api";

function Schedules({ username, role, userId }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // 'month', 'week', or 'day'
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'view', 'edit', or 'delete'

  // Fetch schedules and related data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const userData = await api.getUserData(userId, role);
        setSchedules(userData.schedules || []);
        setProjects(userData.projects || []);
        setClients(userData.clients || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching schedules:", err);
        setError("Failed to load schedules. Please try again later.");
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, role]);

  // Helper function to format date (e.g., "March 2025")
  const formatMonthAndYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Helper function for week view (e.g., "Mar 31 - Apr 6, 2025")
  const formatWeekRange = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)

    const startMonth = startOfWeek.toLocaleDateString("en-US", {
      month: "short",
    });
    const endMonth = endOfWeek.toLocaleDateString("en-US", { month: "short" });
    const startDay = startOfWeek.getDate();
    const endDay = endOfWeek.getDate();
    const year = endOfWeek.getFullYear();

    // If start and end are in the same month
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    }

    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  };

  // Helper function for day view (e.g., "Monday, March 31, 2025")
  const formatDayFull = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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

  // Get the days for the current week
  const getDaysInWeek = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start with Sunday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push({
        date: day,
        outsideMonth: day.getMonth() !== currentDate.getMonth(),
      });
    }

    return days;
  };

  // Get hours for day view
  const getHoursInDay = () => {
    const hours = [];
    for (let i = 8; i < 21; i++) {
      // 8 AM to 8 PM
      hours.push({
        hour: i,
        label: i > 12 ? `${i - 12} PM` : i === 12 ? "12 PM" : `${i} AM`,
      });
    }
    return hours;
  };

  // Navigate to previous period based on current view
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else if (view === "week") {
      newDate.setDate(currentDate.getDate() - 7);
    } else if (view === "day") {
      newDate.setDate(currentDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  // Navigate to next period based on current view
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else if (view === "week") {
      newDate.setDate(currentDate.getDate() + 7);
    } else if (view === "day") {
      newDate.setDate(currentDate.getDate() + 1);
    }
    setCurrentDate(newDate);
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

  // Get events for a specific hour on a specific day
  const getEventsForHour = (date, hour) => {
    const startHour = new Date(date);
    startHour.setHours(hour, 0, 0, 0);

    const endHour = new Date(date);
    endHour.setHours(hour + 1, 0, 0, 0);

    return schedules.filter((event) => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);

      return (
        eventStart.getDate() === date.getDate() &&
        eventStart.getMonth() === date.getMonth() &&
        eventStart.getFullYear() === date.getFullYear() &&
        ((eventStart >= startHour && eventStart < endHour) ||
          (eventEnd > startHour && eventEnd <= endHour) ||
          (eventStart <= startHour && eventEnd >= endHour))
      );
    });
  };

  // Handle event actions
  const handleEventAction = (scheduleEvent, action, e) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedEvent(scheduleEvent);
    setModalMode(action);
  };

  // Close modal
  const closeModal = () => {
    setSelectedEvent(null);
    setModalMode(null);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    // In a real app, you'd call an API endpoint to delete the event
    // For now, we'll just update the local state
    const updatedSchedules = schedules.filter(
      (schedule) => schedule.id !== selectedEvent.id
    );
    setSchedules(updatedSchedules);
    closeModal();
  };

  // Render calendar days for month view
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
                    onClick={(e) => handleEventAction(event, "view", e)}
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

  // Render week view
  const renderWeekView = () => {
    const days = getDaysInWeek();
    const hours = getHoursInDay();

    return (
      <div className={styles.weekView}>
        <div className={styles.weekHeader}>
          <div className={styles.weekHourLabel}></div>
          {days.map((day, index) => (
            <div
              key={index}
              className={`${styles.weekDay} ${
                isToday(day.date) ? styles.today : ""
              } ${day.outsideMonth ? styles.outsideMonth : ""}`}
            >
              <div className={styles.weekDayName}>
                {day.date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className={styles.weekDayNumber}>{day.date.getDate()}</div>
            </div>
          ))}
        </div>
        <div className={styles.weekBody}>
          {hours.map((hour, hourIndex) => (
            <div key={hourIndex} className={styles.weekRow}>
              <div className={styles.weekHourLabel}>{hour.label}</div>
              {days.map((day, dayIndex) => {
                const hourEvents = getEventsForHour(day.date, hour.hour);
                return (
                  <div
                    key={dayIndex}
                    className={`${styles.weekCell} ${
                      isToday(day.date) ? styles.todayCell : ""
                    }`}
                  >
                    {hourEvents.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`${styles.weekEvent} ${
                          styles[event.status]
                        }`}
                        onClick={(e) => handleEventAction(event, "view", e)}
                      >
                        <div className={styles.weekEventTime}>
                          {formatTime(event.start_time)}
                        </div>
                        <div className={styles.weekEventTitle}>
                          {event.title}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const hours = getHoursInDay();

    return (
      <div className={styles.dayView}>
        <div className={styles.dayHeader}>
          <div className={styles.dayTitle}>{formatDayFull(currentDate)}</div>
        </div>
        <div className={styles.dayBody}>
          {hours.map((hour, hourIndex) => {
            const hourEvents = getEventsForHour(currentDate, hour.hour);
            return (
              <div key={hourIndex} className={styles.dayRow}>
                <div className={styles.dayHourLabel}>{hour.label}</div>
                <div className={styles.dayHourContent}>
                  {hourEvents.map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`${styles.dayEvent} ${styles[event.status]}`}
                      onClick={(e) => handleEventAction(event, "view", e)}
                    >
                      <div className={styles.dayEventTime}>
                        {formatTime(event.start_time)} -{" "}
                        {formatTime(event.end_time)}
                      </div>
                      <div className={styles.dayEventTitle}>{event.title}</div>
                      <div className={styles.dayEventLocation}>
                        <FiMapPin size={12} /> {event.location}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render event details modal
  const renderEventModal = () => {
    if (!selectedEvent || !modalMode) return null;

    return (
      <div className={styles.modalOverlay} onClick={closeModal}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3>
              {modalMode === "view" && "Schedule Details"}
              {modalMode === "edit" && "Edit Schedule"}
              {modalMode === "delete" && "Delete Schedule"}
            </h3>
            <button className={styles.closeButton} onClick={closeModal}>
              <FiX />
            </button>
          </div>

          <div className={styles.modalContent}>
            {modalMode === "view" && (
              <div className={styles.eventDetails}>
                <div
                  className={`${styles.eventStatusBadge} ${
                    styles[selectedEvent.status]
                  }`}
                >
                  {selectedEvent.status.charAt(0).toUpperCase() +
                    selectedEvent.status.slice(1)}
                </div>
                <h4 className={styles.eventModalTitle}>
                  {selectedEvent.title}
                </h4>
                <div className={styles.eventModalInfo}>
                  <div className={styles.infoRow}>
                    <div className={styles.infoIcon}>
                      <FiCalendar />
                    </div>
                    <div>
                      <p className={styles.infoLabel}>Date</p>
                      <p className={styles.infoValue}>
                        {formatDate(selectedEvent.start_time)}
                      </p>
                    </div>
                  </div>
                  <div className={styles.infoRow}>
                    <div className={styles.infoIcon}>
                      <FiClock />
                    </div>
                    <div>
                      <p className={styles.infoLabel}>Time</p>
                      <p className={styles.infoValue}>
                        {formatTime(selectedEvent.start_time)} -{" "}
                        {formatTime(selectedEvent.end_time)}
                      </p>
                    </div>
                  </div>
                  <div className={styles.infoRow}>
                    <div className={styles.infoIcon}>
                      <FiMapPin />
                    </div>
                    <div>
                      <p className={styles.infoLabel}>Location</p>
                      <p className={styles.infoValue}>
                        {selectedEvent.location}
                      </p>
                    </div>
                  </div>
                  {selectedEvent.client_id && (
                    <div className={styles.infoRow}>
                      <div className={styles.infoIcon}>
                        <FiUsers />
                      </div>
                      <div>
                        <p className={styles.infoLabel}>Client</p>
                        <p className={styles.infoValue}>
                          {getClientName(selectedEvent.client_id)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedEvent.project_id && (
                    <div className={styles.infoRow}>
                      <div className={styles.infoIcon}>
                        <FiFolder />
                      </div>
                      <div>
                        <p className={styles.infoLabel}>Project</p>
                        <p className={styles.infoValue}>
                          {getProjectName(selectedEvent.project_id)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedEvent.description && (
                  <div className={styles.descriptionSection}>
                    <h5 className={styles.descriptionTitle}>Description</h5>
                    <p className={styles.descriptionText}>
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                <div className={styles.modalActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => setModalMode("edit")}
                  >
                    <FiEdit /> Edit
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => setModalMode("delete")}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            )}

            {modalMode === "delete" && (
              <div className={styles.deleteConfirmation}>
                <p>Are you sure you want to delete this schedule?</p>
                <p className={styles.eventTitle}>{selectedEvent.title}</p>
                <p>
                  {formatDate(selectedEvent.start_time)} at{" "}
                  {formatTime(selectedEvent.start_time)}
                </p>
                <div className={styles.modalActions}>
                  <button className={styles.cancelButton} onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className={styles.confirmDeleteButton}
                    onClick={handleDeleteConfirm}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            )}

            {modalMode === "edit" && (
              <div className={styles.editForm}>
                <p>Edit form would be implemented here in a real application</p>
                <div className={styles.modalActions}>
                  <button className={styles.cancelButton} onClick={closeModal}>
                    Cancel
                  </button>
                  <button className={styles.saveButton} onClick={closeModal}>
                    <FiCheck /> Save
                  </button>
                </div>
              </div>
            )}
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
          <button className={styles.addButton}>
            <FiPlus /> Add Schedule
          </button>
        </div>
      </div>

      <div className={styles.calendarView}>
        <div className={styles.navigationHeader}>
          <div className={styles.navigationControls}>
            <button className={styles.navButton} onClick={goToPrevious}>
              <FiChevronLeft />
            </button>
            <button className={styles.navButton} onClick={goToToday}>
              Today
            </button>
            <button className={styles.navButton} onClick={goToNext}>
              <FiChevronRight />
            </button>
            <div className={styles.currentDate}>
              {view === "month" && formatMonthAndYear(currentDate)}
              {view === "week" && formatWeekRange(currentDate)}
              {view === "day" && formatDayFull(currentDate)}
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

        {view === "month" && (
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
        )}

        {view === "week" && renderWeekView()}

        {view === "day" && renderDayView()}
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
                      {event.location}
                    </div>
                  </div>
                </div>
                <div className={styles.eventActions}>
                  <button
                    className={styles.actionButton}
                    title="View"
                    onClick={(e) => handleEventAction(event, "view", e)}
                  >
                    <FiEye />
                  </button>
                  <button
                    className={styles.actionButton}
                    title="Edit"
                    onClick={(e) => handleEventAction(event, "edit", e)}
                  >
                    <FiEdit />
                  </button>
                  <button
                    className={styles.actionButton}
                    title="Delete"
                    onClick={(e) => handleEventAction(event, "delete", e)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {renderEventModal()}
    </div>
  );
}

export default Schedules;
