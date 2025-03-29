import api from "./api.js";

const authService = {
  login: async function (email, password, role) {
    try {
      const response = await api.login(email, password, role);
      console.log(response);

      if (response.success) {
        // Save user data to localStorage
        localStorage.setItem("user", JSON.stringify(response));
        return response;
      } else {
        throw new Error(response.message || "Login failed. Please try again.");
      }
    } catch (error) {
      throw new Error(
        error.message || "Network error. Please try again later."
      );
    }
  },

  getUser: function () {
    // Retrieve user data from localStorage
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  logout: function () {
    // Clear user data from localStorage
    localStorage.removeItem("user");
  },
};

export default authService;
