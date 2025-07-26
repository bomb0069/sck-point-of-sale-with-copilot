-- Sample data for SCK POS System
-- Run this after the main schema.sql

USE sck_pos;

-- Insert sample products
INSERT INTO products (sku, name, description, category_id, price, cost, stock_quantity, min_stock_level, barcode, is_active) VALUES
('COFFEE001', 'Premium Coffee Beans - Dark Roast', 'High-quality dark roast coffee beans from Colombia', 3, 15.99, 8.50, 45, 10, '1234567890123', true),
('COFFEE002', 'Premium Coffee Beans - Medium Roast', 'Smooth medium roast coffee beans', 3, 14.99, 8.00, 50, 10, '1234567890124', true),
('COFFEE003', 'Premium Coffee Beans - Light Roast', 'Bright light roast coffee beans', 3, 13.99, 7.50, 35, 10, '1234567890125', true),
('BOOK001', 'Business Management Guide', 'Complete guide to small business management', 4, 29.99, 15.00, 20, 5, '1234567890126', true),
('BOOK002', 'Marketing Essentials', 'Essential marketing strategies for modern business', 4, 24.99, 12.50, 15, 5, '1234567890127', true),
('ELEC001', 'Wireless Bluetooth Headphones', 'High-quality wireless headphones with noise cancellation', 1, 89.99, 45.00, 25, 8, '1234567890128', true),
('ELEC002', 'USB-C Charging Cable', 'Fast charging USB-C cable 6ft', 1, 12.99, 5.00, 100, 20, '1234567890129', true),
('CLOTH001', 'Cotton T-Shirt - Blue', 'Comfortable cotton t-shirt in blue', 2, 19.99, 8.00, 30, 10, '1234567890130', true),
('CLOTH002', 'Cotton T-Shirt - Red', 'Comfortable cotton t-shirt in red', 2, 19.99, 8.00, 25, 10, '1234567890131', true),
('HOME001', 'Ceramic Coffee Mug', 'Premium ceramic coffee mug 12oz', 5, 8.99, 3.50, 60, 15, '1234567890132', true),
('HOME002', 'Stainless Steel Water Bottle', 'Insulated stainless steel water bottle 20oz', 5, 24.99, 12.00, 40, 12, '1234567890133', true),
('SNACK001', 'Organic Granola Bar', 'Healthy organic granola bar with nuts', 3, 3.99, 1.50, 80, 20, '1234567890134', true);

-- Insert sample customers
INSERT INTO customers (name, email, phone, address, loyalty_points, is_active) VALUES
('John Smith', 'john.smith@email.com', '(555) 123-4567', '123 Main Street, Anytown, ST 12345', 150, true),
('Sarah Johnson', 'sarah.johnson@email.com', '(555) 234-5678', '456 Oak Avenue, Somewhere, ST 23456', 75, true),
('Mike Wilson', 'mike.wilson@email.com', '(555) 345-6789', '789 Pine Road, Elsewhere, ST 34567', 220, true),
('Emily Davis', 'emily.davis@email.com', '(555) 456-7890', '321 Elm Street, Nowhere, ST 45678', 50, true),
('David Brown', 'david.brown@email.com', '(555) 567-8901', '654 Maple Lane, Anywhere, ST 56789', 180, true);

-- Update admin user password hash for 'admin123'
UPDATE users SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye.PHvH5EQjGQOJ1JHCOhCpR1JAFQMoHK' WHERE username = 'admin';

-- Insert a sample cashier user (password: cashier123)
INSERT INTO users (username, email, password_hash, full_name, role, is_active) VALUES 
('cashier', 'cashier@sckpos.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.PHvH5EQjGQOJ1JHCOhCpR1JAFQMoHK', 'Demo Cashier', 'cashier', true);

-- Insert a sample manager user (password: manager123)
INSERT INTO users (username, email, password_hash, full_name, role, is_active) VALUES 
('manager', 'manager@sckpos.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.PHvH5EQjGQOJ1JHCOhCpR1JAFQMoHK', 'Demo Manager', 'manager', true);
