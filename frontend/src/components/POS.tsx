import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, DollarSign, X, User, Gift, Star } from 'lucide-react';
import { Product, CartItem, Cart, Customer, CustomerLoyaltySummary, CreateSale } from '../types';
import * as api from '../services/api';
import { formatThaiCurrency, convertUsdToThb } from '../utils/currency';

// Thai banknotes and coins
const THAI_DENOMINATIONS = [
  { value: 1000, label: '฿1,000', color: 'bg-purple-100 border-purple-300 text-purple-800' },
  { value: 500, label: '฿500', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { value: 100, label: '฿100', color: 'bg-red-100 border-red-300 text-red-800' },
  { value: 50, label: '฿50', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { value: 20, label: '฿20', color: 'bg-green-100 border-green-300 text-green-800' },
  { value: 10, label: '฿10', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { value: 5, label: '฿5', color: 'bg-gray-100 border-gray-300 text-gray-800' },
  { value: 1, label: '฿1', color: 'bg-gray-50 border-gray-200 text-gray-700' },
];

const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    tax_amount: 0,
    discount_amount: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashReceived, setCashReceived] = useState(0);
  const [selectedBanknotes, setSelectedBanknotes] = useState<{[key: number]: number}>({});
  
  // Customer and Loyalty States
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [loyaltySummary, setLoyaltySummary] = useState<CustomerLoyaltySummary | null>(null);
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [cart.items, loyaltyDiscount]);

  const loadProducts = async () => {
    try {
      // Mock data with Thai Baht prices
      const mockProducts: Product[] = [
        {
          id: 1,
          sku: 'PROD001',
          name: 'Coffee - Medium Roast',
          description: 'Premium medium roast coffee beans',
          category_id: 1,
          category_name: 'Beverages',
          price: 450.00, // ~$12.99 converted to THB
          cost: 297.50,
          stock_quantity: 50,
          min_stock_level: 10,
          barcode: '1234567890123',
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 2,
          sku: 'PROD002',
          name: 'Notebook - A4',
          description: 'Professional A4 notebook',
          category_id: 2,
          category_name: 'Office Supplies',
          price: 210.00, // ~$5.99 converted to THB
          cost: 122.50,
          stock_quantity: 25,
          min_stock_level: 5,
          barcode: '1234567890124',
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 3,
          sku: 'PROD003',
          name: 'Water Bottle - 500ml',
          description: 'Reusable water bottle',
          category_id: 1,
          category_name: 'Beverages',
          price: 315.00, // ~$8.99 converted to THB
          cost: 175.00,
          stock_quantity: 30,
          min_stock_level: 8,
          barcode: '1234567890125',
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];
      setProducts(mockProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax_rate = 0.08; // 8% tax
    const tax_amount = subtotal * tax_rate;
    const total = subtotal + tax_amount - cart.discount_amount - loyaltyDiscount;

    setCart(prev => ({
      ...prev,
      subtotal,
      tax_amount,
      total,
    }));
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.items.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        return {
          ...prev,
          items: [...prev.items, { product, quantity: 1, discount: 0 }],
        };
      }
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ),
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.product.id !== productId),
    }));
  };

  const clearCart = () => {
    setCart({
      items: [],
      subtotal: 0,
      tax_amount: 0,
      discount_amount: 0,
      total: 0,
    });
    setSelectedCustomer(null);
    setLoyaltySummary(null);
    setLoyaltyPointsToUse(0);
    setLoyaltyDiscount(0);
  };

  // Customer and Loyalty Functions
  const loadCustomers = async () => {
    try {
      const customerList = await api.getCustomers();
      setCustomers(Array.isArray(customerList) ? customerList : []);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers([]); // Ensure customers is always an array
    }
  };

  const selectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
    
    try {
      const summary = await api.getCustomerLoyaltySummary(customer.id);
      setLoyaltySummary(summary);
    } catch (error) {
      console.error('Failed to load customer loyalty summary:', error);
    }
  };

  const handleLoyaltyPointsChange = (points: number) => {
    if (!loyaltySummary) return;
    
    const maxPoints = Math.min(
      loyaltySummary.available_points,
      Math.floor(cart.total * 10) // Max points that can be used (total * 10 since 1 baht = 10 points)
    );
    
    const validPoints = Math.max(0, Math.min(points, maxPoints));
    setLoyaltyPointsToUse(validPoints);
    setLoyaltyDiscount(validPoints * 0.1); // 1 point = 0.1 baht
  };

  const calculatePointsToEarn = (amount: number): number => {
    return Math.floor(amount / 100); // 1 point per 100 baht
  };

  const processPayment = async () => {
    setShowPaymentModal(true);
  };

  const handleBanknoteSelect = (denomination: number) => {
    setSelectedBanknotes(prev => ({
      ...prev,
      [denomination]: (prev[denomination] || 0) + 1
    }));
  };

  const handleBanknoteRemove = (denomination: number) => {
    setSelectedBanknotes(prev => {
      const newCount = (prev[denomination] || 0) - 1;
      if (newCount <= 0) {
        const { [denomination]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [denomination]: newCount
      };
    });
  };

  const calculateCashTotal = () => {
    return Object.entries(selectedBanknotes).reduce((total, [denomination, count]) => {
      return total + (parseInt(denomination) * count);
    }, 0);
  };

  const getChangeAmount = () => {
    const cashTotal = calculateCashTotal();
    return cashTotal - cart.total;
  };

  const calculateOptimalChange = (changeAmount: number) => {
    if (changeAmount <= 0) return [];
    
    const change: Array<{denomination: number, count: number, label: string}> = [];
    let remaining = changeAmount;
    
    for (const denom of THAI_DENOMINATIONS) {
      if (remaining >= denom.value) {
        const count = Math.floor(remaining / denom.value);
        change.push({
          denomination: denom.value,
          count,
          label: denom.label
        });
        remaining = remaining % denom.value;
      }
    }
    
    return change;
  };

  const completeCashPayment = async () => {
    const cashTotal = calculateCashTotal();
    const changeAmount = getChangeAmount();
    
    if (cashTotal < cart.total) {
      alert('Insufficient cash received!');
      return;
    }

    try {
      // Redeem loyalty points if any
      if (loyaltyPointsToUse > 0 && selectedCustomer) {
        await api.redeemLoyaltyPoints({
          customer_id: selectedCustomer.id,
          points_to_redeem: loyaltyPointsToUse,
          baht_amount: loyaltyDiscount
        });
      }

      // Create sale transaction
      const saleData: CreateSale = {
        customer_id: selectedCustomer?.id,
        subtotal: cart.subtotal,
        tax_amount: cart.tax_amount,
        discount_amount: cart.discount_amount,
        loyalty_points_used: loyaltyPointsToUse,
        loyalty_discount_amount: loyaltyDiscount,
        total_amount: cart.total,
        payment_method: 'cash' as const,
        payment_status: 'completed' as const,
        items: cart.items.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          discount_amount: item.discount,
          subtotal: item.product.price * item.quantity - item.discount
        }))
      };

      await api.createSale(saleData);
      
      const pointsEarned = calculatePointsToEarn(cart.total);
      
      let successMessage = `Payment completed!\nCash received: ฿${cashTotal.toFixed(2)}\nChange: ฿${changeAmount.toFixed(2)}`;
      
      if (loyaltyPointsToUse > 0) {
        successMessage += `\nLoyalty points used: ${loyaltyPointsToUse} (฿${loyaltyDiscount.toFixed(2)} discount)`;
      }
      
      if (pointsEarned > 0) {
        successMessage += `\nPoints earned: ${pointsEarned}`;
      }
      
      alert(successMessage);
      
      // Reset everything
      clearCart();
      setShowPaymentModal(false);
      setCashReceived(0);
      setSelectedBanknotes({});
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const closeCashPayment = () => {
    setShowPaymentModal(false);
    setCashReceived(0);
    setSelectedBanknotes({});
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Product Grid */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Point of Sale</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name, SKU, or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md cursor-pointer transition-shadow"
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{product.category_name}</p>
                  <p className="text-lg font-bold text-primary-600">฿{product.price.toFixed(2)}</p>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Stock: {product.stock_quantity}</p>
                  <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white shadow-lg border-l border-gray-200 flex flex-col">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart ({cart.items.length})
            </h2>
            {cart.items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Your cart is empty</p>
              <p className="text-sm">Add products to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                    <p className="text-sm text-gray-500">฿{item.product.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Section */}
        {cart.items.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Customer</h3>
              <button
                onClick={() => {
                  loadCustomers();
                  setShowCustomerModal(true);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {selectedCustomer ? 'Change' : 'Select Customer'}
              </button>
            </div>
            
            {selectedCustomer ? (
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">{selectedCustomer.name}</p>
                    {selectedCustomer.email && (
                      <p className="text-sm text-blue-700">{selectedCustomer.email}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCustomer(null);
                      setLoyaltySummary(null);
                      setLoyaltyPointsToUse(0);
                      setLoyaltyDiscount(0);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {loyaltySummary && (
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-700">Available Points:</span>
                      <span className="text-sm font-medium text-blue-900">
                        {loyaltySummary.available_points} (฿{loyaltySummary.available_baht_value.toFixed(2)})
                      </span>
                    </div>
                    
                    {loyaltySummary.available_points > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm text-blue-700">Use Points:</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="0"
                            max={Math.min(loyaltySummary.available_points, Math.floor(cart.total * 10))}
                            value={loyaltyPointsToUse}
                            onChange={(e) => handleLoyaltyPointsChange(parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium text-blue-900 w-12">
                            {loyaltyPointsToUse}
                          </span>
                        </div>
                        <div className="text-xs text-blue-600">
                          Discount: ฿{loyaltyDiscount.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Select a customer to earn and use loyalty points
              </div>
            )}
          </div>
        )}

        {/* Cart Summary */}
        {cart.items.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>฿{cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (8%):</span>
                <span>฿{cart.tax_amount.toFixed(2)}</span>
              </div>
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Loyalty Discount ({loyaltyPointsToUse} points):</span>
                  <span>-฿{loyaltyDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>฿{cart.total.toFixed(2)}</span>
              </div>
              {selectedCustomer && cart.total > 0 && (
                <div className="flex justify-between text-sm text-blue-600 mt-1">
                  <span>Points to earn:</span>
                  <span>{calculatePointsToEarn(cart.total)} points</span>
                </div>
              )}
            </div>
            
            <button
              onClick={processPayment}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Process Payment
            </button>
          </div>
        )}
      </div>

      {/* Cash Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Cash Payment</h2>
              <button
                onClick={closeCashPayment}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2">Order Total</h3>
              <div className="text-2xl font-bold text-primary-600">
                ฿{cart.total.toFixed(2)}
              </div>
            </div>

            {/* Cash Selection */}
            <div className="mb-4">
              <h3 className="font-semibold mb-3">Select Banknotes & Coins</h3>
              <div className="grid grid-cols-2 gap-2">
                {THAI_DENOMINATIONS.map((denom) => (
                  <div key={denom.value} className="text-center">
                    <button
                      onClick={() => handleBanknoteSelect(denom.value)}
                      className={`w-full p-3 rounded-lg border-2 ${denom.color} hover:opacity-80 transition-opacity`}
                    >
                      <div className="font-semibold">{denom.label}</div>
                    </button>
                    {!!selectedBanknotes[denom.value] && (
                      <div className="mt-1 flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleBanknoteRemove(denom.value)}
                          className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium">
                          {selectedBanknotes[denom.value]}
                        </span>
                        <button
                          onClick={() => handleBanknoteSelect(denom.value)}
                          className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cash Summary */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Cash Received:</span>
                <span className="text-lg font-bold">
                  ฿{calculateCashTotal().toFixed(2)}
                </span>
              </div>
              
              {calculateCashTotal() > 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Change:</span>
                  <span className={`text-lg font-bold ${getChangeAmount() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ฿{getChangeAmount().toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Change Breakdown */}
            {getChangeAmount() > 0 && (
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-2">Change Breakdown:</h4>
                <div className="space-y-1">
                  {calculateOptimalChange(getChangeAmount()).map((item) => (
                    <div key={`${item.denomination}-${item.count}`} className="flex justify-between text-sm">
                      <span>{item.label} × {item.count}</span>
                      <span>฿{(item.denomination * item.count).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={completeCashPayment}
                disabled={calculateCashTotal() < cart.total}
                className={`w-full py-3 px-4 rounded-lg font-medium ${
                  calculateCashTotal() >= cart.total
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {calculateCashTotal() < cart.total 
                  ? `Need ฿${(cart.total - calculateCashTotal()).toFixed(2)} more`
                  : 'Complete Payment'
                }
              </button>
              
              <button
                onClick={closeCashPayment}
                className="w-full py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Selection Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Select Customer</h2>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Customer Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Customer List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(customers || [])
                .filter(customer => 
                  customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  customer.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  customer.phone?.includes(customerSearch)
                )
                .map(customer => (
                  <button
                    key={customer.id}
                    onClick={() => selectCustomer(customer)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    {customer.email && (
                      <div className="text-sm text-gray-600">{customer.email}</div>
                    )}
                    {customer.phone && (
                      <div className="text-sm text-gray-600">{customer.phone}</div>
                    )}
                    <div className="text-sm text-blue-600 mt-1">
                      {customer.loyalty_points} loyalty points
                    </div>
                  </button>
                ))
              }
              
              {customers.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No customers found
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setLoyaltySummary(null);
                  setShowCustomerModal(false);
                }}
                className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                No Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
