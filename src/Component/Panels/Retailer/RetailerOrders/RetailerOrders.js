

import React, { useState, useEffect } from "react";
import AddOrderForm from "./AddOrderForm";
import EditOrderForm from "./EditOrderForm";
import "./RetailerOrders.css";
import { baseurl } from "../../../BaseURL/BaseURL";
import RetailerMobileLayout from "../RetailerMobileLayout";

function RetailerOrders() {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrdersFromDatabase();
  }, []);

  const fetchOrdersFromDatabase = async () => {
    try {
      setLoading(true);
      setError("");
      
      const userString = localStorage.getItem('user');
      if (!userString) {
        throw new Error('User not found. Please log in again.');
      }

      const user = JSON.parse(userString);
      const userId = user.id;

      if (!userId) {
        throw new Error('Invalid user ID');
      }

      const response = await fetch(`${baseurl}/api/orders/user/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Server error: ${response.status}`);
      }

      const ordersData = await response.json();
      setOrders(ordersData);

    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(`Failed to load orders: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrder = (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    setShowForm(false);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
  };

  const handleUpdateOrder = (updatedOrder) => {
    setOrders(prev => prev.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    ));
    setEditingOrder(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      const response = await fetch(`${baseurl}/api/orders/${orderId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to delete order');
      }

      setOrders(prev => prev.filter(order => order.id !== orderId));
      alert('Order deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting order:', error);
      alert(`Error deleting order: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="retailer-orders">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <>
    <RetailerMobileLayout>
    <div className="retailer-orders">
      {/* Header */}
      <div className="orders-header">
        <h1>My Orders</h1>
        <button 
          className="add-order-btn"
          onClick={() => setShowForm(true)}
        >
          + Add Order
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchOrdersFromDatabase} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Add Order Form */}
      {showForm && (
        <AddOrderForm 
          onAddOrder={handleAddOrder}
          onCancel={handleCancelForm}
        />
      )}

      {/* Edit Order Form */}
      {editingOrder && (
        <EditOrderForm 
          order={editingOrder}
          onUpdateOrder={handleUpdateOrder}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Orders List */}
      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Create your first order to get started</p>
            <button 
              className="create-order-btn"
              onClick={() => setShowForm(true)}
            >
              Create Order
            </button>
          </div>
        ) : (
          <div className="orders-container">
            {orders.map(order => (
              <div key={order.id} className="order-item">
                <div className="order-header">
                  <h3 className="product-name">{order.product}</h3>
                  <span className={`status ₹{order.status}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="order-category">
                  <span>{order.category}</span>
                </div>
                
                <div className="order-details">
                  <div className="detail">
                    <span>Qty: {order.quantity}</span>
                    <span>₹{parseFloat(order.price).toFixed(2)} each</span>
                  </div>
                  <div className="detail">
                    <span>Total:</span>
                    <span className="total-price">₹{parseFloat(order.totalPrice).toFixed(2)}</span>
                  </div>
                  <div className="detail">
  <span>Date: {new Date(order.date).toLocaleDateString('en-IN')}</span>
  <span className="order-id">#{order.id}</span>
</div>
                </div>
                
                <div className="order-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditOrder(order)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteOrder(order.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </RetailerMobileLayout>
    </>
  );
}

export default RetailerOrders;