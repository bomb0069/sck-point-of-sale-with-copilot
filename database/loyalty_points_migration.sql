-- Loyalty Points System Migration
-- This migration adds tables and functionality for loyalty points system
-- Requirements:
-- 1. Every 100 Baht earn 1 point
-- 2. Points can be used to buy products in next bill
-- 3. Points expire in 180 days
-- 4. Points have value = 0.1 baht (10 points = 1 baht)

USE sck_pos;

-- Loyalty Points Transactions table
-- Records all point earnings and redemptions
CREATE TABLE loyalty_point_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    transaction_type ENUM('earned', 'redeemed', 'expired') NOT NULL,
    points INT NOT NULL, -- positive for earned, negative for redeemed/expired
    sale_id INT, -- reference to the sale that generated/used these points
    baht_amount DECIMAL(10, 2), -- amount in baht that generated points (for earned) or was paid with points (for redeemed)
    expiry_date DATE, -- when these points expire (180 days from earned date)
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL,
    INDEX idx_customer_date (customer_id, created_at),
    INDEX idx_expiry (expiry_date),
    INDEX idx_type (transaction_type)
);

-- Loyalty Point Balances table
-- Maintains current point balances with expiry tracking
CREATE TABLE loyalty_point_balances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    points INT NOT NULL,
    earned_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    is_expired BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer (customer_id),
    INDEX idx_expiry (expiry_date),
    INDEX idx_customer_expiry (customer_id, expiry_date),
    UNIQUE KEY unique_customer_earned_date (customer_id, earned_date)
);

-- Create triggers to automatically calculate loyalty points on sales

DELIMITER //

-- Trigger to award loyalty points when a sale is completed
CREATE TRIGGER award_loyalty_points_after_sale
AFTER INSERT ON sales
FOR EACH ROW
BEGIN
    DECLARE points_to_award INT DEFAULT 0;
    DECLARE expiry_date DATE;
    
    -- Only award points if customer is specified and sale is completed
    IF NEW.customer_id IS NOT NULL AND NEW.payment_status = 'completed' THEN
        -- Calculate points: 1 point per 100 baht (floor division)
        SET points_to_award = FLOOR(NEW.total_amount / 100);
        
        -- Set expiry date to 180 days from now
        SET expiry_date = DATE_ADD(CURDATE(), INTERVAL 180 DAY);
        
        -- Only proceed if points are greater than 0
        IF points_to_award > 0 THEN
            -- Insert transaction record
            INSERT INTO loyalty_point_transactions (
                customer_id, 
                transaction_type, 
                points, 
                sale_id, 
                baht_amount, 
                expiry_date,
                notes
            ) VALUES (
                NEW.customer_id, 
                'earned', 
                points_to_award, 
                NEW.id, 
                NEW.total_amount, 
                expiry_date,
                CONCAT('Points earned from sale #', NEW.receipt_number)
            );
            
            -- Insert or update balance record
            INSERT INTO loyalty_point_balances (
                customer_id, 
                points, 
                earned_date, 
                expiry_date
            ) VALUES (
                NEW.customer_id, 
                points_to_award, 
                CURDATE(), 
                expiry_date
            ) ON DUPLICATE KEY UPDATE
                points = points + points_to_award,
                updated_at = CURRENT_TIMESTAMP;
            
            -- Update customer's total loyalty points
            UPDATE customers 
            SET loyalty_points = loyalty_points + points_to_award,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.customer_id;
        END IF;
    END IF;
END//

-- Trigger to handle point redemption
CREATE TRIGGER update_loyalty_points_after_redemption
AFTER INSERT ON loyalty_point_transactions
FOR EACH ROW
BEGIN
    -- Only process redemption transactions
    IF NEW.transaction_type = 'redeemed' THEN
        -- Update customer's total loyalty points (subtract redeemed points)
        UPDATE customers 
        SET loyalty_points = loyalty_points + NEW.points, -- NEW.points is negative for redemption
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.customer_id;
    END IF;
END//

DELIMITER ;

-- Create stored procedure to redeem loyalty points
DELIMITER //

CREATE PROCEDURE redeem_loyalty_points(
    IN p_customer_id INT,
    IN p_points_to_redeem INT,
    IN p_sale_id INT,
    IN p_baht_amount DECIMAL(10,2)
)
BEGIN
    DECLARE points_available INT DEFAULT 0;
    DECLARE points_remaining INT DEFAULT 0;
    DECLARE current_balance_id INT;
    DECLARE current_balance_points INT;
    DECLARE points_to_deduct INT;
    DECLARE done INT DEFAULT FALSE;
    
    -- Cursor to get available point balances (oldest first, not expired)
    DECLARE balance_cursor CURSOR FOR 
        SELECT id, points 
        FROM loyalty_point_balances 
        WHERE customer_id = p_customer_id 
          AND points > 0 
          AND expiry_date > CURDATE() 
          AND is_expired = FALSE
        ORDER BY earned_date ASC;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    START TRANSACTION;
    
    -- Check if customer has enough points
    SELECT COALESCE(SUM(points), 0) INTO points_available
    FROM loyalty_point_balances 
    WHERE customer_id = p_customer_id 
      AND points > 0 
      AND expiry_date > CURDATE() 
      AND is_expired = FALSE;
    
    IF points_available < p_points_to_redeem THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient loyalty points';
    END IF;
    
    -- Record the redemption transaction
    INSERT INTO loyalty_point_transactions (
        customer_id, 
        transaction_type, 
        points, 
        sale_id, 
        baht_amount,
        notes
    ) VALUES (
        p_customer_id, 
        'redeemed', 
        -p_points_to_redeem, 
        p_sale_id, 
        p_baht_amount,
        CONCAT('Points redeemed for ฿', p_baht_amount, ' discount')
    );
    
    -- Deduct points from balances (FIFO - oldest first)
    SET points_remaining = p_points_to_redeem;
    
    OPEN balance_cursor;
    
    read_loop: LOOP
        FETCH balance_cursor INTO current_balance_id, current_balance_points;
        
        IF done OR points_remaining <= 0 THEN
            LEAVE read_loop;
        END IF;
        
        -- Calculate how many points to deduct from this balance
        IF current_balance_points >= points_remaining THEN
            SET points_to_deduct = points_remaining;
            SET points_remaining = 0;
        ELSE
            SET points_to_deduct = current_balance_points;
            SET points_remaining = points_remaining - current_balance_points;
        END IF;
        
        -- Update the balance
        UPDATE loyalty_point_balances 
        SET points = points - points_to_deduct,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = current_balance_id;
        
    END LOOP;
    
    CLOSE balance_cursor;
    
    COMMIT;
END//

-- Create stored procedure to expire old points
CREATE PROCEDURE expire_loyalty_points()
BEGIN
    DECLARE points_expired INT DEFAULT 0;
    DECLARE customer_id_var INT;
    DECLARE done INT DEFAULT FALSE;
    
    -- Cursor to get customers with expired points
    DECLARE customer_cursor CURSOR FOR 
        SELECT DISTINCT customer_id, SUM(points) as expired_points
        FROM loyalty_point_balances 
        WHERE expiry_date <= CURDATE() 
          AND points > 0 
          AND is_expired = FALSE
        GROUP BY customer_id;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    START TRANSACTION;
    
    OPEN customer_cursor;
    
    expire_loop: LOOP
        FETCH customer_cursor INTO customer_id_var, points_expired;
        
        IF done THEN
            LEAVE expire_loop;
        END IF;
        
        -- Record expiration transaction
        INSERT INTO loyalty_point_transactions (
            customer_id, 
            transaction_type, 
            points, 
            notes
        ) VALUES (
            customer_id_var, 
            'expired', 
            -points_expired,
            CONCAT('Points expired: ', points_expired, ' points')
        );
        
        -- Mark expired balances
        UPDATE loyalty_point_balances 
        SET is_expired = TRUE, 
            updated_at = CURRENT_TIMESTAMP
        WHERE customer_id = customer_id_var 
          AND expiry_date <= CURDATE() 
          AND is_expired = FALSE;
        
        -- Update customer total
        UPDATE customers 
        SET loyalty_points = loyalty_points - points_expired,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = customer_id_var;
        
    END LOOP;
    
    CLOSE customer_cursor;
    
    COMMIT;
END//

DELIMITER ;

-- Create function to calculate available loyalty points for a customer
DELIMITER //

CREATE FUNCTION get_available_loyalty_points(p_customer_id INT) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE available_points INT DEFAULT 0;
    
    SELECT COALESCE(SUM(points), 0) INTO available_points
    FROM loyalty_point_balances 
    WHERE customer_id = p_customer_id 
      AND points > 0 
      AND expiry_date > CURDATE() 
      AND is_expired = FALSE;
    
    RETURN available_points;
END//

-- Create function to convert points to baht value
CREATE FUNCTION points_to_baht(p_points INT) 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    -- 10 points = 1 baht, so 1 point = 0.1 baht
    RETURN p_points * 0.1;
END//

-- Create function to convert baht to points needed
CREATE FUNCTION baht_to_points(p_baht DECIMAL(10,2)) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    -- 1 baht = 10 points
    RETURN CEILING(p_baht * 10);
END//

DELIMITER ;

-- Create view for customer loyalty summary
CREATE VIEW customer_loyalty_summary AS
SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    c.loyalty_points as total_points,
    get_available_loyalty_points(c.id) as available_points,
    points_to_baht(get_available_loyalty_points(c.id)) as available_baht_value,
    (
        SELECT COUNT(*) 
        FROM loyalty_point_transactions lpt 
        WHERE lpt.customer_id = c.id AND lpt.transaction_type = 'earned'
    ) as total_transactions,
    (
        SELECT COALESCE(SUM(baht_amount), 0) 
        FROM loyalty_point_transactions lpt 
        WHERE lpt.customer_id = c.id AND lpt.transaction_type = 'earned'
    ) as total_spent,
    c.created_at as member_since
FROM customers c
WHERE c.is_active = TRUE;

-- Insert some sample loyalty data for testing
INSERT INTO customers (name, email, phone) VALUES 
('John Doe', 'john.doe@email.com', '555-0101'),
('Jane Smith', 'jane.smith@email.com', '555-0102'),
('Bob Johnson', 'bob.johnson@email.com', '555-0103');
