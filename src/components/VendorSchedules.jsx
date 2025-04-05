import React, { useState, useEffect } from "react";
import { useVendorData } from "../contexts/VendorDataContext";
import styles from "./Schedules.module.css"; // Reusing existing styles
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
  FiCalendar,
  FiUser,
  FiShoppingBag,
} from "react-icons/fi";
import api from "../services/api";

function VendorSchedules({ username, role, userId }) {
  const { schedules, setSchedules, products } = useVendorData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // 'month', 'week', or 'day'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editSchedule, setEditSchedule] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
    product_id: "",
    status: "scheduled",
    vendor_id: userId,
  });

  // Fetch schedules on component mount
  useEffect(() => {
    const fetchVendorSchedules = async () => {
      try {
        setLoading(true);

        if (userId && schedules.length === 0) {
          // Fetch data from the API only if context data is empty
          const data = await api.getUserData(userId, role);

          // Save data to context
          setSchedules(data.schedules || []);
          console.log("Fetched Schedules from API:", data.schedules);
        }
      } catch (error) {
        console.error("Error fetching data from API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorSchedules();
  }, [userId, role, schedules.length, setSchedules]);

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
      vendor_id: userId,
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
      product_id: "",
      status: "scheduled",
      vendor_id: userId,
    });
  };

  // Handle viewing a schedule
  const handleViewSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setShowViewModal(true);
  };

  // Handle editing a schedule
  const handleEditSchedule = (schedule) => {
    // Convert date strings to input-compatible format (YYYY-MM-DDThh:mm)
    const formatDateForInput = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    };

    setEditSchedule({
      ...schedule,
      start_time: formatDateForInput(schedule.start_time),
      end_time: formatDateForInput(schedule.end_time),
    });
    setShowEditModal(true);
  };

  // Handle deleting a schedule
  const handleDeleteSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDeleteConfirm(true);
  };

  // Confirm schedule deletion
  const confirmDeleteSchedule = () => {
    setSchedules(schedules.filter((s) => s.id !== selectedSchedule.id));
    setShowDeleteConfirm(false);
    setSelectedSchedule(null);
  };

  // Handle input change for edit schedule form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditSchedule((prev) => ({ ...prev, [name]: value }));
  };

  // Save edited schedule
  const saveEditedSchedule = () => {
    // Validate form
    if (
      !editSchedule.title ||
      !editSchedule.start_time ||
      !editSchedule.end_time
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Update schedule in state
    setSchedules(
      schedules.map((s) => (s.id === editSchedule.id ? editSchedule : s))
    );

    // Close modal
    setShowEditModal(false);
    setEditSchedule(null);
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

  // Get product name from product ID
  const getProductName = (productId) => {
    if (!productId) return "N/A";
    const product = products.find((p) => p.id === productId);
    return product ? product.name : "N/A";
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

  // Navigate to previous month/week/day
  const goToPreviousPeriod = () => {
    if (view === "month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    } else if (view === "week") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else if (view === "day") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  // Navigate to next month/week/day
  const goToNextPeriod = () => {
    if (view === "month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    } else if (view === "week") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else if (view === "day") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  // Get current period string (month, week, or day)
  const getCurrentPeriodString = () => {
    if (view === "month") {
      return formatMonthAndYear(currentDate);
    } else if (view === "week") {
      const weekStart = new Date(currentDate);
      const day = currentDate.getDay();
      weekStart.setDate(currentDate.getDate() - day);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
    } else if (view === "day") {
      return formatDate(currentDate);
    }
  };

  // Get events for a specific day
  const getEventsForDay = (date) => {
    // Parse date to get year, month, day
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Filter schedules for this day
    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.start_time);
      return (
        scheduleDate.getFullYear() === year &&
        scheduleDate.getMonth() === month &&
        scheduleDate.getDate() === day
      );
    });
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

  // Get hour slots for day/week view
  const getHourSlots = () => {
    const hours = [];
    for (let i = 7; i < 20; i++) {
      // 7 AM to 7 PM
      const hour = i % 12 || 12;
      const ampm = i < 12 ? "AM" : "PM";
      hours.push(`${hour} ${ampm}`);
    }
    return hours;
  };

  // Check if an event is in a specific hour slot
  const isEventInHourSlot = (event, date, hourIndex) => {
    const eventDate = new Date(event.start_time);
    const hour = eventDate.getHours();
    const hourSlotValue = hourIndex + 7; // Adjust based on your hour slots (7 AM start)

    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear() &&
      hour === hourSlotValue
    );
  };

  // Render month view
  const renderMonthView = () => {
    const days = getDaysInMonthGrid();
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className={styles.monthViewContainer}>
        <div className={styles.weekdaysHeader}>
          {weekdays.map((day) => (
            <div key={day} className={styles.weekdayCell}>
              {day}
            </div>
          ))}
        </div>

        <div className={styles.daysGrid}>
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day.date);
            const hasManyEvents = dayEvents.length > 2;

            return (
              <div
                key={index}
                className={`${styles.dayCell} ${
                  day.outsideMonth ? styles.outsideMonth : ""
                } ${isToday(day.date) ? styles.today : ""}`}
              >
                <div className={styles.dayNumber}>{day.date.getDate()}</div>
                <div className={styles.dayEvents}>
                  {dayEvents.slice(0, 2).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`${styles.eventItem} ${styles[event.status]}`}
                      onClick={() => handleViewSchedule(event)}
                    >
                      <div className={styles.eventTime}>
                        {formatTime(event.start_time)}
                      </div>
                      <div className={styles.eventTitle}>{event.title}</div>
                    </div>
                  ))}
                  {hasManyEvents && (
                    <div
                      className={styles.moreEvents}
                      onClick={() => {
                        setCurrentDate(day.date);
                        setView("day");
                      }}
                    >
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Format a date as just the time
  const formatTimeOnly = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading schedules...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.schedulesContainer}>
      <h1 className={styles.pageTitle}>Schedules</h1>

      {/* Calendar Controls */}
      <div className={styles.calendarControls}>
        <div className={styles.periodNavigation}>
          <button className={styles.navButton} onClick={goToPreviousPeriod}>
            <FiChevronLeft />
          </button>
          <h2 className={styles.currentPeriod}>{getCurrentPeriodString()}</h2>
          <button className={styles.navButton} onClick={goToNextPeriod}>
            <FiChevronRight />
          </button>
        </div>
        <div className={styles.viewControls}>
          <div className={styles.viewButtons}>
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
          <button
            className={styles.addButton}
            onClick={() => setShowAddModal(true)}
          >
            <FiPlus /> Add Schedule
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className={styles.calendarView}>
        {view === "month" && renderMonthView()}
      </div>

      {/* View Schedule Modal */}
      {showViewModal && selectedSchedule && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Schedule Details</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowViewModal(false)}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <h2 className={styles.viewTitle}>{selectedSchedule.title}</h2>

              <div className={styles.viewDetail}>
                <FiCalendar />
                <div>
                  <div className={styles.viewLabel}>Date & Time</div>
                  <div>
                    {formatDate(selectedSchedule.start_time)},{" "}
                    {formatTimeOnly(selectedSchedule.start_time)} to{" "}
                    {formatTimeOnly(selectedSchedule.end_time)}
                  </div>
                </div>
              </div>

              {selectedSchedule.location && (
                <div className={styles.viewDetail}>
                  <FiMapPin />
                  <div>
                    <div className={styles.viewLabel}>Location</div>
                    <div>{selectedSchedule.location}</div>
                  </div>
                </div>
              )}

              {selectedSchedule.product_id && (
                <div className={styles.viewDetail}>
                  <FiShoppingBag />
                  <div>
                    <div className={styles.viewLabel}>Related Product</div>
                    <div>{getProductName(selectedSchedule.product_id)}</div>
                  </div>
                </div>
              )}

              {selectedSchedule.description && (
                <div className={styles.viewDescription}>
                  <div className={styles.viewLabel}>Description</div>
                  <p>{selectedSchedule.description}</p>
                </div>
              )}

              <div className={styles.viewActions}>
                <button
                  className={styles.editButton}
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditSchedule(selectedSchedule);
                  }}
                >
                  <FiEdit /> Edit
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => {
                    setShowViewModal(false);
                    handleDeleteSchedule(selectedSchedule);
                  }}
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {showAddModal && (
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddSchedule();
                }}
              >
                <div className={styles.formGroup}>
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newSchedule.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newSchedule.description}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="start_time">Start Time</label>
                    <input
                      type="datetime-local"
                      id="start_time"
                      name="start_time"
                      value={newSchedule.start_time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="end_time">End Time</label>
                    <input
                      type="datetime-local"
                      id="end_time"
                      name="end_time"
                      value={newSchedule.end_time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={newSchedule.location}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="product_id">Related Product</label>
                  <select
                    id="product_id"
                    name="product_id"
                    value={newSchedule.product_id}
                    onChange={handleInputChange}
                  >
                    <option value="">None</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={newSchedule.status}
                    onChange={handleInputChange}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    <FiSave /> Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && editSchedule && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Edit Schedule</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowEditModal(false)}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveEditedSchedule();
                }}
              >
                <div className={styles.formGroup}>
                  <label htmlFor="edit_title">Title</label>
                  <input
                    type="text"
                    id="edit_title"
                    name="title"
                    value={editSchedule.title}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="edit_description">Description</label>
                  <textarea
                    id="edit_description"
                    name="description"
                    value={editSchedule.description}
                    onChange={handleEditInputChange}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="edit_start_time">Start Time</label>
                    <input
                      type="datetime-local"
                      id="edit_start_time"
                      name="start_time"
                      value={editSchedule.start_time}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="edit_end_time">End Time</label>
                    <input
                      type="datetime-local"
                      id="edit_end_time"
                      name="end_time"
                      value={editSchedule.end_time}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="edit_location">Location</label>
                  <input
                    type="text"
                    id="edit_location"
                    name="location"
                    value={editSchedule.location}
                    onChange={handleEditInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="edit_product_id">Related Product</label>
                  <select
                    id="edit_product_id"
                    name="product_id"
                    value={editSchedule.product_id}
                    onChange={handleEditInputChange}
                  >
                    <option value="">None</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="edit_status">Status</label>
                  <select
                    id="edit_status"
                    name="status"
                    value={editSchedule.status}
                    onChange={handleEditInputChange}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    <FiSave /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedSchedule && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete the schedule "
              {selectedSchedule.title}"? This action cannot be undone.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={styles.deleteButton}
                onClick={confirmDeleteSchedule}
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorSchedules;
