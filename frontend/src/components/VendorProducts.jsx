import { useState, useEffect } from "react";
import { useVendorData } from "../contexts/VendorDataContext";
import { Link } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiInfo,
  FiBarChart2,
  FiSearch,
  FiFilter,
  FiX,
  FiImage,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import api from "../services/api.js";
import styles from "./VendorProducts.module.css"; // Reusing existing styles

function VendorProducts({ username, userId, role }) {
  const { products, setProducts } = useVendorData();
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "",
    price: 0,
    unit: "",
    in_stock: true,
    stock_quantity: 0,
    min_order_quantity: 1,
    lead_time: "",
    specifications: {},
  });

  // Fetch products and designers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("userId:", userId, "role:", role);

        if (userId) {          // Fetch product data from the API if context data is empty
          if (products.length === 0) {
            const data = await api.getUserData(userId, role);
            setProducts(data.products || []);
            console.log("Fetched Products from API:", data.products);
          }
        }
      } catch (error) {
        console.error("Error fetching data from API:", error);
      } finally {
        setLoading(false);
      }
    };    fetchData();
  }, [
    userId,
    role,
    products.length,
    setProducts,
  ]);

  // Update filtered products when products or search term changes
  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);
  // Filter products based on search term
  const filterProducts = () => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercasedTerm) ||
        product.description.toLowerCase().includes(lowercasedTerm) ||
        product.category.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredProducts(filtered);
  };
  // Handle adding a new product
  const handleAddProduct = async () => {
    try {
      const productToAdd = {
        ...newProduct,
        id: `product_${Date.now()}`,
        vendor_id: userId,
        images: [], // Would be populated from actual image uploads
        created_at: new Date().toISOString(),
      };

      console.log("➕ Adding new product:", productToAdd);
      
      // Call API to add product to database
      const addedProduct = await api.addProduct(productToAdd);
      
      // Update local state with the response from API
      setProducts([...products, addedProduct]);
      
      console.log("✅ Product added successfully");
      setShowAddModal(false);      setNewProduct({
        name: "",
        description: "",
        category: "",
        price: 0,
        unit: "",
        in_stock: true,
        stock_quantity: 0,
        min_order_quantity: 1,
        lead_time: "",
        specifications: {},
      });
    } catch (error) {
      console.error("❌ Error adding product:", error);
      alert("Failed to add product. Please try again.");
    }
  };

  // Handle editing a product
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };  // Handle saving edited product
  const handleSaveEdit = async () => {
    try {
      console.log("💾 Saving product changes:", selectedProduct);
      
      // Call API to update product in database
      const updatedProduct = await api.updateProduct(selectedProduct.id, selectedProduct);
      
      console.log("📊 API Response:", updatedProduct);
      
      // Ensure we have the updated product data with all necessary fields
      const productWithDefaults = {
        ...selectedProduct,
        ...updatedProduct,
        id: selectedProduct.id, // Ensure ID is preserved
        price: updatedProduct.price || selectedProduct.price || 0,
        unit: updatedProduct.unit || selectedProduct.unit || "unit",
        category: updatedProduct.category || selectedProduct.category || "Uncategorized",
        stock_quantity: updatedProduct.stock_quantity || selectedProduct.stock_quantity || 0,
        min_order_quantity: updatedProduct.min_order_quantity || selectedProduct.min_order_quantity || 1,
      };
      
      console.log("🔧 Product with defaults:", productWithDefaults);
      
      // Update local state with the complete product data
      setProducts(
        products.map((p) => (p.id === selectedProduct.id ? productWithDefaults : p))
      );
      
      console.log("✅ Product updated successfully in local state");
      setShowEditModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("❌ Error updating product:", error);
      alert("Failed to update product. Please try again.");
    }
  };

  // Handle deleting a product
  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };
  // Confirm product deletion
  const confirmDeleteProduct = async () => {
    try {
      console.log("🗑️ Deleting product:", selectedProduct.id);
      
      // Call API to delete product from database
      await api.deleteProduct(selectedProduct.id);
      
      // Update local state
      setProducts(products.filter((p) => p.id !== selectedProduct.id));
      
      console.log("✅ Product deleted successfully");
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  // Handle input changes for the new product form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle input changes for the edit product form
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  if (loading) {
    return <div className={styles.loading}>Loading products...</div>;
  }

  return (
    <div className={styles.productsContainer}>
      <h1 className={styles.pageTitle}>My Products</h1>

      {/* Search and Add Product Bar */}
      <div className={styles.actionsBar}>
        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button
          className={styles.addButton}
          onClick={() => setShowAddModal(true)}
        >
          <FiPlus /> Add New Product
        </button>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className={styles.emptyState}>
          <FiPackage size={48} />
          <h3>No products found</h3>
          <p>
            {products.length === 0
              ? "You haven't added any products yet."
              : "No products match your search."}
          </p>
          {products.length === 0 && (
            <button
              className={styles.addButton}
              onClick={() => setShowAddModal(true)}
            >
              <FiPlus /> Add Your First Product
            </button>
          )}
        </div>
      ) : (
        <div className={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImageContainer}>
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className={styles.productImage}
                  />
                ) : (
                  <div className={styles.noImagePlaceholder}>
                    <FiImage size={40} />
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <div className={styles.productContent}>
                <div className={styles.productHeader}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <div className={styles.productActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => openEditModal(product)}
                      title="Edit product"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => openDeleteModal(product)}
                      title="Delete product"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <div className={styles.productDescription}>
                  {product.description}
                </div>                <div className={styles.productMeta}>
                  <div className={styles.productPrice}>
                    <FaRupeeSign /> {(product.price || 0).toLocaleString()} /{" "}
                    {product.unit || "unit"}
                  </div>
                  <div className={styles.productCategory}>
                    <span className={styles.categoryBadge}>
                      {product.category || "Uncategorized"}
                    </span>
                  </div>
                </div>                <div className={styles.productDetails}>                  <div key="stock" className={styles.detailItem}>
                    <span className={styles.detailLabel}>Stock:</span>
                    <span className={styles.detailValue}>
                      {product.in_stock
                        ? `${product.stock_quantity || 0} ${product.unit || "unit"}s`
                        : "Out of stock"}
                    </span>
                  </div><div key="min-order" className={styles.detailItem}>
                    <span className={styles.detailLabel}>Min Order:</span>
                    <span className={styles.detailValue}>
                      {product.min_order_quantity || 1} {product.unit || "unit"}
                      {(product.min_order_quantity || 1) !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div key="lead-time" className={styles.detailItem}>
                    <span className={styles.detailLabel}>Lead Time:</span>
                    <span className={styles.detailValue}>
                      {product.lead_time || "Not specified"}
                    </span>
                  </div>
                </div>
                {product.used_in_projects &&
                  product.used_in_projects.length > 0 && (
                    <div className={styles.productUsage}>
                      <FiBarChart2 />
                      <span>
                        Used in {product.used_in_projects.length} project
                        {product.used_in_projects.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalLarge}>
            <div className={styles.modalHeader}>
              <h2>Add New Product</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowAddModal(false)}
              >
                <FiX size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddProduct();
                }}
              >
                <div className={styles.formGroup}>
                  <label htmlFor="name">Product Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    required
                    className={styles.formTextarea}
                    rows={4}
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={newProduct.category}
                      onChange={handleInputChange}
                      required
                      className={styles.formSelect}
                    >
                      <option value="">Select Category</option>
                      <option value="wood">Wood</option>
                      <option value="metal">Metal</option>
                      <option value="fabric">Fabric</option>
                      <option value="lighting">Lighting</option>
                      <option value="fixtures">Fixtures</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="price">Price</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      min="0"
                      step="0.01"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      required
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="unit">Unit</label>
                    <input
                      type="text"
                      id="unit"
                      name="unit"
                      placeholder="piece, meter, sq ft"
                      value={newProduct.unit}
                      onChange={handleInputChange}
                      required
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="lead_time">Lead Time</label>
                    <input
                      type="text"
                      id="lead_time"
                      name="lead_time"
                      placeholder="2 weeks, 3 days"
                      value={newProduct.lead_time}
                      onChange={handleInputChange}
                      required
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="stock_quantity">Stock Quantity</label>
                    <input
                      type="number"
                      id="stock_quantity"
                      name="stock_quantity"
                      min="0"
                      value={newProduct.stock_quantity}
                      onChange={handleInputChange}
                      required
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="min_order_quantity">
                      Min Order Quantity
                    </label>
                    <input
                      type="number"
                      id="min_order_quantity"
                      name="min_order_quantity"
                      min="1"                      value={newProduct.min_order_quantity}
                      onChange={handleInputChange}
                      required
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="in_stock"
                      checked={newProduct.in_stock}
                      onChange={handleInputChange}
                    />
                    <span>In Stock</span>
                  </label>
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
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalLarge}>
            <div className={styles.modalHeader}>
              <h2>Edit Product</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowEditModal(false)}
              >
                <FiX size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveEdit();
                }}
              >                <div className={styles.formGroup}>
                  <label htmlFor="edit-name">Product Name</label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={selectedProduct?.name || ""}
                    onChange={handleEditChange}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-description">Description</label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={selectedProduct?.description || ""}
                    onChange={handleEditChange}
                    required
                    className={styles.formTextarea}
                    rows={4}
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="edit-category">Category</label>
                    <select
                      id="edit-category"
                      name="category"
                      value={selectedProduct?.category || ""}
                      onChange={handleEditChange}
                      required
                      className={styles.formSelect}
                    >
                      <option value="">Select Category</option>
                      <option value="wood">Wood</option>
                      <option value="metal">Metal</option>
                      <option value="fabric">Fabric</option>
                      <option value="lighting">Lighting</option>
                      <option value="fixtures">Fixtures</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="edit-price">Price</label>
                    <input
                      type="number"
                      id="edit-price"
                      name="price"
                      min="0"
                      step="0.01"
                      value={selectedProduct?.price || 0}
                      onChange={handleEditChange}
                      required
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="edit-unit">Unit</label>
                    <input
                      type="text"
                      id="edit-unit"
                      name="unit"
                      value={selectedProduct?.unit || ""}
                      onChange={handleEditChange}
                      required
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="edit-lead_time">Lead Time</label>
                    <input
                      type="text"
                      id="edit-lead_time"
                      name="lead_time"
                      value={selectedProduct?.lead_time || ""}
                      onChange={handleEditChange}
                      required
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="edit-stock_quantity">Stock Quantity</label>
                    <input
                      type="number"
                      id="edit-stock_quantity"
                      name="stock_quantity"
                      min="0"
                      value={selectedProduct?.stock_quantity || 0}
                      onChange={handleEditChange}
                      required
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="edit-min_order_quantity">
                      Min Order Quantity
                    </label>
                    <input
                      type="number"
                      id="edit-min_order_quantity"
                      name="min_order_quantity"
                      min="1"
                      value={selectedProduct?.min_order_quantity || 1}                      onChange={handleEditChange}
                      required
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="in_stock"
                      checked={selectedProduct?.in_stock || false}
                      onChange={handleEditChange}
                    />
                    <span>In Stock</span>
                  </label>
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
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Delete Product</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowDeleteModal(false)}
              >
                <FiX size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>              <p>
                Are you sure you want to delete{" "}
                <strong>{selectedProduct?.name || "this product"}</strong>? This action cannot be
                undone.
              </p>
              {selectedProduct?.used_in_projects &&
                selectedProduct.used_in_projects.length > 0 && (
                  <div className={styles.warningMessage}>
                    <FiInfo />
                    <span>
                      This product is used in{" "}
                      {selectedProduct.used_in_projects.length} active
                      project(s). Deleting it may affect those projects.
                    </span>
                  </div>
                )}
              <div className={styles.formActions}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={confirmDeleteProduct}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorProducts;
