package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// LoyaltyHandler handles loyalty points related requests
type LoyaltyHandler struct {
	db *sql.DB
}

// NewLoyaltyHandler creates a new loyalty handler
func NewLoyaltyHandler(db *sql.DB) *LoyaltyHandler {
	return &LoyaltyHandler{db: db}
}

// LoyaltyPointTransaction represents a loyalty point transaction
type LoyaltyPointTransaction struct {
	ID              int       `json:"id"`
	CustomerID      int       `json:"customer_id"`
	TransactionType string    `json:"transaction_type"`
	Points          int       `json:"points"`
	SaleID          *int      `json:"sale_id,omitempty"`
	BahtAmount      *float64  `json:"baht_amount,omitempty"`
	ExpiryDate      *string   `json:"expiry_date,omitempty"`
	Notes           *string   `json:"notes,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
}

// LoyaltyPointBalance represents a loyalty point balance
type LoyaltyPointBalance struct {
	ID         int       `json:"id"`
	CustomerID int       `json:"customer_id"`
	Points     int       `json:"points"`
	EarnedDate string    `json:"earned_date"`
	ExpiryDate string    `json:"expiry_date"`
	IsExpired  bool      `json:"is_expired"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// CustomerLoyaltySummary represents customer loyalty summary
type CustomerLoyaltySummary struct {
	ID                  int     `json:"id"`
	Name                string  `json:"name"`
	Email               *string `json:"email,omitempty"`
	Phone               *string `json:"phone,omitempty"`
	TotalPoints         int     `json:"total_points"`
	AvailablePoints     int     `json:"available_points"`
	AvailableBahtValue  float64 `json:"available_baht_value"`
	TotalTransactions   int     `json:"total_transactions"`
	TotalSpent          float64 `json:"total_spent"`
	MemberSince         string  `json:"member_since"`
}

// LoyaltyRedemption represents a redemption request
type LoyaltyRedemption struct {
	CustomerID      int     `json:"customer_id" binding:"required"`
	PointsToRedeem  int     `json:"points_to_redeem" binding:"required,min=1"`
	BahtAmount      float64 `json:"baht_amount" binding:"required,min=0.1"`
	SaleID          *int    `json:"sale_id,omitempty"`
}

// GetCustomerLoyaltySummary gets loyalty summary for a customer
func (h *LoyaltyHandler) GetCustomerLoyaltySummary(c *gin.Context) {
	customerIDStr := c.Param("id")
	customerID, err := strconv.Atoi(customerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	query := `
		SELECT 
			id, name, email, phone, total_points, available_points, 
			available_baht_value, total_transactions, total_spent, member_since
		FROM customer_loyalty_summary 
		WHERE id = ?`

	var summary CustomerLoyaltySummary
	err = h.db.QueryRow(query, customerID).Scan(
		&summary.ID,
		&summary.Name,
		&summary.Email,
		&summary.Phone,
		&summary.TotalPoints,
		&summary.AvailablePoints,
		&summary.AvailableBahtValue,
		&summary.TotalTransactions,
		&summary.TotalSpent,
		&summary.MemberSince,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get loyalty summary"})
		}
		return
	}

	c.JSON(http.StatusOK, summary)
}

// GetCustomerLoyaltyTransactions gets loyalty transactions for a customer
func (h *LoyaltyHandler) GetCustomerLoyaltyTransactions(c *gin.Context) {
	customerIDStr := c.Param("id")
	customerID, err := strconv.Atoi(customerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	query := `
		SELECT 
			id, customer_id, transaction_type, points, sale_id, 
			baht_amount, expiry_date, notes, created_at
		FROM loyalty_point_transactions 
		WHERE customer_id = ? 
		ORDER BY created_at DESC
		LIMIT 100`

	rows, err := h.db.Query(query, customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get loyalty transactions"})
		return
	}
	defer rows.Close()

	var transactions []LoyaltyPointTransaction
	for rows.Next() {
		var transaction LoyaltyPointTransaction
		err := rows.Scan(
			&transaction.ID,
			&transaction.CustomerID,
			&transaction.TransactionType,
			&transaction.Points,
			&transaction.SaleID,
			&transaction.BahtAmount,
			&transaction.ExpiryDate,
			&transaction.Notes,
			&transaction.CreatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan transaction"})
			return
		}
		transactions = append(transactions, transaction)
	}

	if transactions == nil {
		transactions = []LoyaltyPointTransaction{}
	}

	c.JSON(http.StatusOK, transactions)
}

// GetCustomerLoyaltyBalances gets loyalty point balances for a customer
func (h *LoyaltyHandler) GetCustomerLoyaltyBalances(c *gin.Context) {
	customerIDStr := c.Param("id")
	customerID, err := strconv.Atoi(customerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	query := `
		SELECT 
			id, customer_id, points, earned_date, expiry_date, 
			is_expired, created_at, updated_at
		FROM loyalty_point_balances 
		WHERE customer_id = ? AND points > 0
		ORDER BY expiry_date ASC`

	rows, err := h.db.Query(query, customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get loyalty balances"})
		return
	}
	defer rows.Close()

	var balances []LoyaltyPointBalance
	for rows.Next() {
		var balance LoyaltyPointBalance
		err := rows.Scan(
			&balance.ID,
			&balance.CustomerID,
			&balance.Points,
			&balance.EarnedDate,
			&balance.ExpiryDate,
			&balance.IsExpired,
			&balance.CreatedAt,
			&balance.UpdatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan balance"})
			return
		}
		balances = append(balances, balance)
	}

	if balances == nil {
		balances = []LoyaltyPointBalance{}
	}

	c.JSON(http.StatusOK, balances)
}

// GetAvailableLoyaltyPoints gets available points for a customer
func (h *LoyaltyHandler) GetAvailableLoyaltyPoints(c *gin.Context) {
	customerIDStr := c.Param("id")
	customerID, err := strconv.Atoi(customerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	query := `SELECT get_available_loyalty_points(?)`
	var availablePoints int
	err = h.db.QueryRow(query, customerID).Scan(&availablePoints)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get available points"})
		return
	}

	bahtValue := float64(availablePoints) * 0.1

	c.JSON(http.StatusOK, gin.H{
		"available_points": availablePoints,
		"baht_value":       bahtValue,
	})
}

// RedeemLoyaltyPoints redeems loyalty points for a discount
func (h *LoyaltyHandler) RedeemLoyaltyPoints(c *gin.Context) {
	var redemption LoyaltyRedemption
	if err := c.ShouldBindJSON(&redemption); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate that points value matches baht amount (10 points = 1 baht)
	expectedBahtValue := float64(redemption.PointsToRedeem) * 0.1
	if abs(redemption.BahtAmount-expectedBahtValue) > 0.01 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Points value does not match baht amount",
			"expected_baht_value": expectedBahtValue,
		})
		return
	}

	// Call stored procedure to redeem points
	var saleIDParam interface{} = nil
	if redemption.SaleID != nil {
		saleIDParam = *redemption.SaleID
	}

	_, err := h.db.Exec(
		"CALL redeem_loyalty_points(?, ?, ?, ?)",
		redemption.CustomerID,
		redemption.PointsToRedeem,
		saleIDParam,
		redemption.BahtAmount,
	)

	if err != nil {
		if err.Error() == "Error 1644: Insufficient loyalty points" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient loyalty points"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to redeem points"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":         "Points redeemed successfully",
		"points_redeemed": redemption.PointsToRedeem,
		"baht_value":      redemption.BahtAmount,
	})
}

// CalculatePointsEarned calculates how many points would be earned for an amount
func (h *LoyaltyHandler) CalculatePointsEarned(c *gin.Context) {
	amountStr := c.Query("amount")
	if amountStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Amount parameter is required"})
		return
	}

	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil || amount < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount"})
		return
	}

	// 1 point per 100 baht
	points := int(amount / 100)

	c.JSON(http.StatusOK, gin.H{
		"points":         points,
		"baht_per_point": 100,
	})
}

// CalculatePointsValue calculates the baht value of points
func (h *LoyaltyHandler) CalculatePointsValue(c *gin.Context) {
	pointsStr := c.Query("points")
	if pointsStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Points parameter is required"})
		return
	}

	points, err := strconv.Atoi(pointsStr)
	if err != nil || points < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid points"})
		return
	}

	// 1 point = 0.1 baht (10 points = 1 baht)
	bahtValue := float64(points) * 0.1

	c.JSON(http.StatusOK, gin.H{
		"baht_value":      bahtValue,
		"points_per_baht": 10,
	})
}

// ExpireLoyaltyPoints manually expires loyalty points (usually run as a cron job)
func (h *LoyaltyHandler) ExpireLoyaltyPoints(c *gin.Context) {
	// This would typically be called by a scheduled job
	_, err := h.db.Exec("CALL expire_loyalty_points()")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to expire points"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Loyalty points expiration process completed",
	})
}

// Helper function for absolute value
func abs(x float64) float64 {
	if x < 0 {
		return -x
	}
	return x
}
