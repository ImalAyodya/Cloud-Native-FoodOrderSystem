// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // ✅ Also make sure this is imported!
// import { useAuth } from '../context/AuthContext';

// const Root = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (user) {
//       if (user.role === 'admin') {
//         navigate('/order/dashboard');
//       } else if (user.role === 'restaurant_owner') {
//         navigate('/restaurant/dashboard');
//       } else if (user.role === 'delivery_person') {
//         navigate('/delivery/dashboard');
//       } else if (user.role === 'customer') {
//         navigate('/dashboard');
//       } else {
//         navigate('/login');
//       }
//     } else {
//       navigate('/login');
//     }
//   }, [user, navigate]);

//   return null;
// };

// export default Root;

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Root = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect after loading completes
    if (!loading) {
      console.log("Root component - User:", user);
      
      if (user) {
        if (user.role === 'admin') {
          navigate('/order/dashboard');
        } else if (user.role === 'restaurant_owner') {
          navigate('/restaurant/dashboard');
        } else if (user.role === 'delivery_person') {
          navigate('/delivery/home');
        } else if (user.role === 'customer') {
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    }
  }, [user, loading, navigate]);

  return null;
};

export default Root;