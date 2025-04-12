import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrderItemsList from '../../components/Order/UpdateOrder/OrderItemsList';
import AddItemsModal from '../../components/Order/UpdateOrder/AddItemsModal';
import PaymentSection from '../../components/Order/UpdateOrder/PaymentSection';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderUpdatePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [originalItems, setOriginalItems] = useState([]);
  const [newlyAddedItems, setNewlyAddedItems] = useState([]);
  const [restaurantFoods, setRestaurantFoods] = useState([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/orders/orders/${orderId}`);
        const data = await response.json();
        setOrder(data.order);
        setOriginalItems(data.order.items);

        const restaurantResponse = await fetch(
          `http://localhost:5001/api/restaurants/foods/${data.order.restaurant}`
        );
        const restaurantData = await restaurantResponse.json();
        setRestaurantFoods(restaurantData.foods);
        setRestaurantName(restaurantData.restaurantName);
      } catch (error) {
        toast.error('Failed to load order details');
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const calculateTotal = (items) =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const mergedItems = [...originalItems];

  // Add or merge newlyAddedItems to mergedItems
  newlyAddedItems.forEach((newItem) => {
    const existingIndex = mergedItems.findIndex((item) => item.name === newItem.name);
    if (existingIndex !== -1) {
      mergedItems[existingIndex].quantity += newItem.quantity;
    } else {
      mergedItems.push(newItem);
    }
  });

  const handleAddItem = (item) => {
    setNewlyAddedItems((prev) => {
      const exists = prev.find((i) => i.name === item.name);
      if (exists) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
    toast.success(`${item.name} added to the order!`);
  };

  const handleRemoveItem = (itemName) => {
    // Check if the item is in the original items
    const isOriginalItem = originalItems.some((item) => item.name === itemName);
    if (isOriginalItem) {
      toast.warning('You cannot remove items that are already in the order!');
      return;
    }

    // Remove from newly added items
    setNewlyAddedItems((prev) => prev.filter((item) => item.name !== itemName));
    toast.info(`${itemName} removed from the newly added items.`);
  };

  const handleCancelUpdate = () => {
    // Navigate back to the previous page or order details page
    navigate(`/myOrders`);
    toast.info('Order update canceled.');
  };

  if (!order) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Update Order</h1>

      <OrderItemsList
        items={mergedItems}
        onRemoveItem={handleRemoveItem} // Only affects newly added items
        totalAmount={calculateTotal(mergedItems)}
        disableRemoveForOriginalItems={true} // Disable remove for original items
      />

      <button
        onClick={() => setShowAddItemsModal(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition mt-4"
      >
        Add Items
      </button>

      <div className="bg-gray-100 rounded-lg p-4 mt-6">
        <h2 className="text-lg font-bold mb-2">Newly Added Items</h2>
        <p className="text-gray-700">
          Balance to Pay: ${calculateTotal(newlyAddedItems).toFixed(2)}
        </p>
      </div>

      <PaymentSection
        paymentMethod={order.paymentMethod}
        totalAmount={calculateTotal(newlyAddedItems)}
        onUpdateOrder={() => toast.success('Order updated successfully!')}
      />

      <div className="flex justify-between mt-6">
        <button
          onClick={handleCancelUpdate}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
        >
          Cancel Update
        </button>
        
      </div>

      {showAddItemsModal && (
        <AddItemsModal
          foods={restaurantFoods}
          onAddItem={handleAddItem}
          onClose={() => setShowAddItemsModal(false)}
          restaurantName={restaurantName}
        />
      )}
    </div>
  );
};

export default OrderUpdatePage;