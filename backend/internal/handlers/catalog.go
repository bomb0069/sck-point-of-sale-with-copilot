package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// Customer represents a customer
type Customer struct {
	ID            int       `json:"id"`
	Name          string    `json:"name"`
	Email         *string   `json:"email"`
	Phone         *string   `json:"phone"`
	Address       *string   `json:"address"`
	LoyaltyPoints int       `json:"loyalty_points"`
	IsActive      bool      `json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// ProductHandler handles product-related requests
type ProductHandler struct {
	db *sql.DB
}

// NewProductHandler creates a new product handler
func NewProductHandler(db *sql.DB) *ProductHandler {
	return &ProductHandler{db: db}
}

// GetProducts retrieves all products
func (h *ProductHandler) GetProducts(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Product listing not implemented yet"})
}

// GetProduct retrieves a single product
func (h *ProductHandler) GetProduct(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Product retrieval not implemented yet"})
}

// CreateProduct creates a new product
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	c.JSON(http.StatusCreated, gin.H{"message": "Product creation not implemented yet"})
}

// UpdateProduct updates an existing product
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Product update not implemented yet"})
}

// DeleteProduct deletes a product
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Product deletion not implemented yet"})
}

// SearchProducts searches for products
func (h *ProductHandler) SearchProducts(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Product search not implemented yet"})
}

// CategoryHandler handles category-related requests
type CategoryHandler struct {
	db *sql.DB
}

// NewCategoryHandler creates a new category handler
func NewCategoryHandler(db *sql.DB) *CategoryHandler {
	return &CategoryHandler{db: db}
}

// GetCategories retrieves all categories
func (h *CategoryHandler) GetCategories(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Category listing not implemented yet"})
}

// GetCategory retrieves a single category
func (h *CategoryHandler) GetCategory(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Category retrieval not implemented yet"})
}

// CreateCategory creates a new category
func (h *CategoryHandler) CreateCategory(c *gin.Context) {
	c.JSON(http.StatusCreated, gin.H{"message": "Category creation not implemented yet"})
}

// UpdateCategory updates an existing category
func (h *CategoryHandler) UpdateCategory(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Category update not implemented yet"})
}

// DeleteCategory deletes a category
func (h *CategoryHandler) DeleteCategory(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Category deletion not implemented yet"})
}

// CustomerHandler handles customer-related requests
type CustomerHandler struct {
	db *sql.DB
}

// NewCustomerHandler creates a new customer handler
func NewCustomerHandler(db *sql.DB) *CustomerHandler {
	return &CustomerHandler{db: db}
}

// GetCustomers retrieves all customers
func (h *CustomerHandler) GetCustomers(c *gin.Context) {
	query := `
		SELECT id, name, email, phone, address, loyalty_points, is_active, created_at, updated_at 
		FROM customers 
		WHERE is_active = 1 
		ORDER BY name ASC
	`
	
	rows, err := h.db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch customers"})
		return
	}
	defer rows.Close()

	var customers []Customer
	for rows.Next() {
		var customer Customer
		err := rows.Scan(
			&customer.ID,
			&customer.Name,
			&customer.Email,
			&customer.Phone,
			&customer.Address,
			&customer.LoyaltyPoints,
			&customer.IsActive,
			&customer.CreatedAt,
			&customer.UpdatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan customer data"})
			return
		}
		customers = append(customers, customer)
	}

	if err = rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, customers)
}

// GetCustomer retrieves a single customer
func (h *CustomerHandler) GetCustomer(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	query := `
		SELECT id, name, email, phone, address, loyalty_points, is_active, created_at, updated_at 
		FROM customers 
		WHERE id = ? AND is_active = 1
	`
	
	var customer Customer
	err = h.db.QueryRow(query, id).Scan(
		&customer.ID,
		&customer.Name,
		&customer.Email,
		&customer.Phone,
		&customer.Address,
		&customer.LoyaltyPoints,
		&customer.IsActive,
		&customer.CreatedAt,
		&customer.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch customer"})
		}
		return
	}

	c.JSON(http.StatusOK, customer)
}

// CreateCustomer creates a new customer
func (h *CustomerHandler) CreateCustomer(c *gin.Context) {
	var customer Customer
	if err := c.ShouldBindJSON(&customer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	if customer.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Customer name is required"})
		return
	}

	query := `
		INSERT INTO customers (name, email, phone, address, loyalty_points, is_active) 
		VALUES (?, ?, ?, ?, 0, 1)
	`
	
	result, err := h.db.Exec(query, customer.Name, customer.Email, customer.Phone, customer.Address)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create customer"})
		return
	}

	id, err := result.LastInsertId()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get customer ID"})
		return
	}

	customer.ID = int(id)
	customer.LoyaltyPoints = 0
	customer.IsActive = true
	customer.CreatedAt = time.Now()
	customer.UpdatedAt = time.Now()

	c.JSON(http.StatusCreated, customer)
}

// UpdateCustomer updates an existing customer
func (h *CustomerHandler) UpdateCustomer(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	var customer Customer
	if err := c.ShouldBindJSON(&customer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	if customer.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Customer name is required"})
		return
	}

	query := `
		UPDATE customers 
		SET name = ?, email = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP 
		WHERE id = ? AND is_active = 1
	`
	
	result, err := h.db.Exec(query, customer.Name, customer.Email, customer.Phone, customer.Address, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update customer"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check update result"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	customer.ID = id
	c.JSON(http.StatusOK, customer)
}

// DeleteCustomer deletes a customer (soft delete)
func (h *CustomerHandler) DeleteCustomer(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	query := `
		UPDATE customers 
		SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
		WHERE id = ? AND is_active = 1
	`
	
	result, err := h.db.Exec(query, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete customer"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check delete result"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Customer deleted successfully"})
}
