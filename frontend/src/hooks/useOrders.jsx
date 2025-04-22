import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      const userId = localStorage.getItem('loggedInUser');
      if (!userId) {
        throw new Error('User not logged in');
      }

      const response = await fetch(`http://localhost:5001/api/orders/user/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      setOrders(data.orders);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, refetchOrders: fetchOrders };
};