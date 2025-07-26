package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// UserHandler handles user-related requests
type UserHandler struct {
	db *sql.DB
}

// NewUserHandler creates a new user handler
func NewUserHandler(db *sql.DB) *UserHandler {
	return &UserHandler{db: db}
}

// GetUsers retrieves all users
func (h *UserHandler) GetUsers(c *gin.Context) {
	query := `
		SELECT id, username, email, full_name, role, is_active, created_at 
		FROM users 
		ORDER BY created_at DESC
	`
	
	rows, err := h.db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		var createdAt string
		err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.FullName, 
			&user.Role, &user.IsActive, &createdAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Scan error"})
			return
		}
		users = append(users, user)
	}

	c.JSON(http.StatusOK, users)
}

// GetUser retrieves a single user by ID
func (h *UserHandler) GetUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var user User
	query := `
		SELECT id, username, email, full_name, role, is_active 
		FROM users 
		WHERE id = ?
	`
	
	err = h.db.QueryRow(query, id).Scan(
		&user.ID, &user.Username, &user.Email, &user.FullName, 
		&user.Role, &user.IsActive,
	)
	
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// CreateUser creates a new user
func (h *UserHandler) CreateUser(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User creation not implemented yet"})
}

// UpdateUser updates an existing user
func (h *UserHandler) UpdateUser(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "User update not implemented yet"})
}

// DeleteUser deletes a user
func (h *UserHandler) DeleteUser(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "User deletion not implemented yet"})
}
