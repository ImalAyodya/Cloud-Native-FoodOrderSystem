import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      const loggedInUser = localStorage.getItem('loggedInUser');
      if (!loggedInUser) {
        throw new Error('User not logged in');
      }

      const parsedUser = JSON.parse(loggedInUser); // Parse the JSON object
      const userId = parsedUser.id; // Extract the user ID

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