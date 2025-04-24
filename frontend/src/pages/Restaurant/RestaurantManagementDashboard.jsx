import { Link } from 'react-router-dom';
import './styles.css';

const RestaurantManagementDashboard = () => {
  const restaurantId = '123'; // Hardcoded for now; ideally, this would come from auth or params

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      <h1>Restaurant Management Dashboard</h1>
      <Link to="/restaurant/list">
        <button
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          Manage Restaurants
        </button>
      </Link>
      <Link to={`/restaurant/${restaurantId}/menu`}>
        <button
          style={{
            backgroundColor: '#20c997',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          Manage Menu Items
        </button>
      </Link>
    </div>
  );
};

export default RestaurantManagementDashboard;