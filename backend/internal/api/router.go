package api

import (
	"database/sql"
	"net/http"

	"sck-pos-backend/internal/config"
	"sck-pos-backend/internal/handlers"
	"sck-pos-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRouter configures and returns the main application router
func SetupRouter(db *sql.DB, cfg *config.Config) *gin.Engine {
	router := gin.New()

	// Middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(middleware.CORS(cfg.AllowedOrigins))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "sck-pos-backend",
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Authentication routes
		auth := v1.Group("/auth")
		{
			authHandler := handlers.NewAuthHandler(db, cfg.JWTSecret)
			auth.POST("/login", authHandler.Login)
			auth.POST("/register", authHandler.Register)
		}

		// Protected routes
		protected := v1.Group("/")
		protected.Use(middleware.AuthRequired(cfg.JWTSecret))
		{
			// User routes
			users := protected.Group("/users")
			{
				userHandler := handlers.NewUserHandler(db)
				users.GET("", userHandler.GetUsers)
				users.POST("", userHandler.CreateUser)
				users.GET("/:id", userHandler.GetUser)
				users.PUT("/:id", userHandler.UpdateUser)
				users.DELETE("/:id", userHandler.DeleteUser)
			}

			// Product routes
			products := protected.Group("/products")
			{
				productHandler := handlers.NewProductHandler(db)
				products.GET("", productHandler.GetProducts)
				products.POST("", productHandler.CreateProduct)
				products.GET("/:id", productHandler.GetProduct)
				products.PUT("/:id", productHandler.UpdateProduct)
				products.DELETE("/:id", productHandler.DeleteProduct)
				products.GET("/search", productHandler.SearchProducts)
			}

			// Category routes
			categories := protected.Group("/categories")
			{
				categoryHandler := handlers.NewCategoryHandler(db)
				categories.GET("", categoryHandler.GetCategories)
				categories.POST("", categoryHandler.CreateCategory)
				categories.GET("/:id", categoryHandler.GetCategory)
				categories.PUT("/:id", categoryHandler.UpdateCategory)
				categories.DELETE("/:id", categoryHandler.DeleteCategory)
			}

			// Customer routes
			customers := protected.Group("/customers")
			{
				customerHandler := handlers.NewCustomerHandler(db)
				customers.GET("", customerHandler.GetCustomers)
				customers.POST("", customerHandler.CreateCustomer)
				customers.GET("/:id", customerHandler.GetCustomer)
				customers.PUT("/:id", customerHandler.UpdateCustomer)
				customers.DELETE("/:id", customerHandler.DeleteCustomer)
				
				// Loyalty points sub-routes
				loyaltyHandler := handlers.NewLoyaltyHandler(db)
				customers.GET("/:id/loyalty/summary", loyaltyHandler.GetCustomerLoyaltySummary)
				customers.GET("/:id/loyalty/transactions", loyaltyHandler.GetCustomerLoyaltyTransactions)
				customers.GET("/:id/loyalty/balances", loyaltyHandler.GetCustomerLoyaltyBalances)
				customers.GET("/:id/loyalty/available", loyaltyHandler.GetAvailableLoyaltyPoints)
			}

			// Loyalty points routes
			loyalty := protected.Group("/loyalty")
			{
				loyaltyHandler := handlers.NewLoyaltyHandler(db)
				loyalty.POST("/redeem", loyaltyHandler.RedeemLoyaltyPoints)
				loyalty.GET("/calculate-points", loyaltyHandler.CalculatePointsEarned)
				loyalty.GET("/calculate-value", loyaltyHandler.CalculatePointsValue)
				loyalty.POST("/expire-points", loyaltyHandler.ExpireLoyaltyPoints)
			}

			// Sales routes
			sales := protected.Group("/sales")
			{
				salesHandler := handlers.NewSalesHandler(db)
				sales.GET("", salesHandler.GetSales)
				sales.POST("", salesHandler.CreateSale)
				sales.GET("/:id", salesHandler.GetSale)
				sales.POST("/:id/refund", salesHandler.RefundSale)
				sales.GET("/reports/daily", salesHandler.GetDailyReport)
				sales.GET("/reports/monthly", salesHandler.GetMonthlyReport)
			}

			// Store routes
			stores := protected.Group("/stores")
			{
				storeHandler := handlers.NewStoreHandler(db)
				stores.GET("", storeHandler.GetStores)
				stores.POST("", storeHandler.CreateStore)
				stores.GET("/:id", storeHandler.GetStore)
				stores.PUT("/:id", storeHandler.UpdateStore)
				stores.DELETE("/:id", storeHandler.DeleteStore)
			}
		}
	}

	return router
}
