# Database Setup

This directory contains the database schema and sample data for the SCK POS system.

## Files

- `schema.sql` - Complete database schema with tables and relationships
- `sample_data.sql` - Sample data for testing and development

## Database Structure

### Core Tables

1. **users** - System users (admin, manager, cashier)
2. **stores** - Store locations for multi-store support
3. **categories** - Product categories
4. **products** - Product catalog with inventory
5. **customers** - Customer information and loyalty points

### Transaction Tables

1. **sales** - Sales transactions
2. **sale_items** - Individual items in each sale
3. **payment_details** - Payment method details
4. **inventory_movements** - Stock movement tracking

## Setup Instructions

1. Create MySQL database:
```sql
CREATE DATABASE sck_pos;
```

2. Import schema:
```bash
mysql -u username -p sck_pos < schema.sql
```

3. Import sample data (optional):
```bash
mysql -u username -p sck_pos < sample_data.sql
```

## Default Credentials

- **Username**: admin
- **Password**: admin123
- **Role**: admin
