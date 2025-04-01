import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useDesignerData } from "../contexts/DesignerDataContext";
import { useNavigate } from "react-router-dom";
import styles from "./Vendors.module.css";
import {
  FiSearch,
  FiInfo,
  FiGrid,
  FiList,
  FiChevronDown,
  FiChevronUp,
  FiMessageSquare,
  FiPlus,
} from "react-icons/fi";

function Vendors({ username, role, userId }) {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProductId, setActiveProductId] = useState(null);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [newVendorData, setNewVendorData] = useState({
    name: "",
    contact: "",
    email: "",
    materials: [],
    lead_time_days: 14,
    rating: 4.0,
  });
  const [materialInput, setMaterialInput] = useState("");
  const navigate = useNavigate();

  // Fetch vendors and products data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Get vendors associated with the logged-in designer
        const userData = await api.getUserData(userId, role);
        setVendors(userData.vendors || []);

        // Fetch all products for filtering by vendor later
        const allProducts = await api.getData("products");
        setProducts(allProducts);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, role]);

  // Filter vendors based on search query
  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.materials.some((material) =>
        material.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Get products for the selected vendor
  const vendorProducts = selectedVendor
    ? products.filter((product) => product.vendor_id === selectedVendor.id)
    : [];

  // Toggle product details
  const toggleProductDetails = (productId) => {
    if (activeProductId === productId) {
      setActiveProductId(null);
    } else {
      setActiveProductId(productId);
    }
  };

  // Handle vendor selection
  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setActiveProductId(null); // Reset active product when changing vendors
  };

  // Handle Add Vendor form input changes
  const handleVendorInputChange = (e) => {
    const { name, value } = e.target;
    setNewVendorData({
      ...newVendorData,
      [name]: value,
    });
  };

  // Handle adding a material to the list
  const handleAddMaterial = () => {
    if (
      materialInput.trim() !== "" &&
      !newVendorData.materials.includes(materialInput.trim())
    ) {
      setNewVendorData({
        ...newVendorData,
        materials: [...newVendorData.materials, materialInput.trim()],
      });
      setMaterialInput("");
    }
  };

  // Handle removing a material from the list
  const handleRemoveMaterial = (material) => {
    setNewVendorData({
      ...newVendorData,
      materials: newVendorData.materials.filter((m) => m !== material),
    });
  };

  // Handle form submission for adding a new vendor
  const handleAddVendor = (e) => {
    e.preventDefault();

    // In a real app, this would send a request to the API
    // For now, we'll just add it to the local state
    const newVendor = {
      ...newVendorData,
      id: `vendor_${Date.now()}`, // Generate a unique ID
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d", // Default avatar
    };

    setVendors([...vendors, newVendor]);

    // Reset form
    setNewVendorData({
      name: "",
      contact: "",
      email: "",
      materials: [],
      lead_time_days: 14,
      rating: 4.0,
    });

    // Close modal
    setShowAddVendorModal(false);
  };

  // Navigate to Messages with the selected vendor
  const handleSendMessage = (vendor) => {
    // In a real app, this would perhaps create a new conversation if one doesn't exist
    // For now, we'll just navigate to the messages page
    navigate("/designer/messages", {
      state: {
        vendorId: vendor.id,
        vendorName: vendor.name,
      },
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Vendors</h1>

      <div className={styles.topActions}>
        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search vendors by name or materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <button
          className={styles.addVendorButton}
          onClick={() => setShowAddVendorModal(true)}
        >
          <FiPlus />
          Add New Vendor
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading vendors data...</div>
      ) : (
        <div className={styles.contentLayout}>
          {/* Vendors List */}
          <div className={styles.vendorsList}>
            <h2 className={styles.sectionTitle}>My Associated Vendors</h2>

            {filteredVendors.length === 0 ? (
              <div className={styles.noResults}>
                <p>No vendors found matching your search criteria.</p>
              </div>
            ) : (
              <div className={styles.vendorsGrid}>
                {filteredVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className={`${styles.vendorCard} ${
                      selectedVendor?.id === vendor.id
                        ? styles.selectedVendor
                        : ""
                    }`}
                  >
                    <div
                      className={styles.vendorCardContent}
                      onClick={() => handleVendorSelect(vendor)}
                    >
                      <div className={styles.vendorAvatar}>
                        {vendor.avatar ? (
                          <img src={vendor.avatar} alt={vendor.name} />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {vendor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className={styles.vendorInfo}>
                        <h3>{vendor.name}</h3>
                        <p>Contact: {vendor.contact}</p>
                        <div className={styles.materialTags}>
                          {vendor.materials.map((material, index) => (
                            <span key={index} className={styles.materialTag}>
                              {material}
                            </span>
                          ))}
                        </div>
                        <div className={styles.vendorStats}>
                          <span className={styles.leadTime}>
                            Lead time: {vendor.lead_time_days} days
                          </span>
                          <span className={styles.rating}>
                            Rating: {vendor.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className={styles.messageButton}
                      onClick={() => handleSendMessage(vendor)}
                      title={`Send message to ${vendor.name}`}
                    >
                      <FiMessageSquare />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Products Section */}
          {selectedVendor && (
            <div className={styles.productsSection}>
              <div className={styles.productsSectionHeader}>
                <h2 className={styles.sectionTitle}>
                  Products from {selectedVendor.name}
                </h2>
                <div className={styles.viewToggle}>
                  <button
                    className={`${styles.viewToggleButton} ${
                      viewMode === "grid" ? styles.active : ""
                    }`}
                    onClick={() => setViewMode("grid")}
                  >
                    <FiGrid />
                  </button>
                  <button
                    className={`${styles.viewToggleButton} ${
                      viewMode === "list" ? styles.active : ""
                    }`}
                    onClick={() => setViewMode("list")}
                  >
                    <FiList />
                  </button>
                </div>
              </div>

              {vendorProducts.length === 0 ? (
                <div className={styles.noResults}>
                  <p>No products available from this vendor.</p>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? styles.productsGrid
                      : styles.productsList
                  }
                >
                  {vendorProducts.map((product) => (
                    <div
                      key={product.id}
                      className={styles.productCard}
                      onClick={() => toggleProductDetails(product.id)}
                    >
                      <div className={styles.productImageContainer}>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className={styles.productImage}
                          />
                        ) : (
                          <div className={styles.noImage}>
                            <FiInfo />
                            <span>No image</span>
                          </div>
                        )}
                      </div>

                      <div className={styles.productInfo}>
                        <h3 className={styles.productName}>{product.name}</h3>
                        <p className={styles.productPrice}>
                          ${product.price} per {product.unit}
                        </p>
                        <p className={styles.productCategory}>
                          Category: {product.category}
                        </p>

                        <div className={styles.productStockInfo}>
                          <span
                            className={`${styles.stockIndicator} ${
                              product.in_stock
                                ? styles.inStock
                                : styles.outOfStock
                            }`}
                          >
                            {product.in_stock ? "In Stock" : "Out of Stock"}
                          </span>
                          {product.in_stock && (
                            <span className={styles.stockQuantity}>
                              {product.stock_quantity} available
                            </span>
                          )}
                        </div>

                        <button className={styles.detailsToggle}>
                          {activeProductId === product.id ? (
                            <>
                              <span>Hide Details</span>
                              <FiChevronUp />
                            </>
                          ) : (
                            <>
                              <span>Show Details</span>
                              <FiChevronDown />
                            </>
                          )}
                        </button>

                        {activeProductId === product.id && (
                          <div className={styles.productDetails}>
                            <p className={styles.productDescription}>
                              {product.description}
                            </p>

                            {product.specifications && (
                              <div className={styles.productSpecs}>
                                <h4>Specifications:</h4>
                                <ul>
                                  {Object.entries(product.specifications).map(
                                    ([key, value]) => (
                                      <li key={key}>
                                        <strong>{key}:</strong> {value}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                            <div className={styles.orderInfo}>
                              <p>
                                <strong>Lead Time:</strong> {product.lead_time}
                              </p>
                              <p>
                                <strong>Minimum Order:</strong>{" "}
                                {product.min_order_quantity} {product.unit}(s)
                              </p>
                            </div>

                            {product.images && product.images.length > 1 && (
                              <div className={styles.additionalImages}>
                                <h4>Additional Images:</h4>
                                <div className={styles.imageGallery}>
                                  {product.images
                                    .slice(1)
                                    .map((image, index) => (
                                      <img
                                        key={index}
                                        src={image}
                                        alt={`${product.name} - Image ${
                                          index + 2
                                        }`}
                                        className={styles.galleryImage}
                                      />
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!selectedVendor && vendors.length > 0 && (
            <div className={styles.vendorSelectPrompt}>
              <div className={styles.promptCard}>
                <FiInfo className={styles.promptIcon} />
                <h3>Select a Vendor</h3>
                <p>Choose a vendor from the list to view their products.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddVendorModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Add New Vendor</h2>
            <form onSubmit={handleAddVendor}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Vendor Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newVendorData.name}
                  onChange={handleVendorInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact">Contact Person</label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  value={newVendorData.contact}
                  onChange={handleVendorInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newVendorData.email}
                  onChange={handleVendorInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="materials">Materials</label>
                <div className={styles.materialsInput}>
                  <input
                    type="text"
                    id="materials"
                    value={materialInput}
                    onChange={(e) => setMaterialInput(e.target.value)}
                    placeholder="Enter material and press Add"
                  />
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className={styles.addMaterialButton}
                  >
                    Add
                  </button>
                </div>
                <div className={styles.materialTags}>
                  {newVendorData.materials.map((material, index) => (
                    <span key={index} className={styles.materialTag}>
                      {material}
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(material)}
                        className={styles.removeMaterial}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lead_time_days">Lead Time (days)</label>
                <input
                  type="number"
                  id="lead_time_days"
                  name="lead_time_days"
                  min="1"
                  value={newVendorData.lead_time_days}
                  onChange={handleVendorInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="rating">Rating (1-5)</label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  min="1"
                  max="5"
                  step="0.1"
                  value={newVendorData.rating}
                  onChange={handleVendorInputChange}
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowAddVendorModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vendors;
