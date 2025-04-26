import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNo: '',
    address: '',
    role: 'customer'
  });
  const [isLoading, setIsLoading] = useState(false);

  const { name, email, password, confirmPassword, phoneNo, address, role } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/auth/register`, {
        name,
        email,
        password,
        phoneNo,
        address,
        role
      });
      
      if (response.data.success) {
        toast.success('Registration successful! Please check your email to verify your account.');
        navigate('/verification-sent', { state: { email } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-orange-500 py-4">
          <h2 className="text-2xl font-bold text-center text-white">Create your DigiDine Account</h2>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center border-b-2 border-orange-200 py-2">
                  <FaUser className="text-orange-400 mr-3" />
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                    className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center border-b-2 border-orange-200 py-2">
                  <FaEnvelope className="text-orange-400 mr-3" />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                    className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center border-b-2 border-orange-200 py-2">
                  <FaLock className="text-orange-400 mr-3" />
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center border-b-2 border-orange-200 py-2">
                  <FaLock className="text-orange-400 mr-3" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    required
                    className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center border-b-2 border-orange-200 py-2">
                  <FaPhone className="text-orange-400 mr-3" />
                  <input
                    type="tel"
                    name="phoneNo"
                    value={phoneNo}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    required
                    className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center border-b-2 border-orange-200 py-2">
                  <FaMapMarkerAlt className="text-orange-400 mr-3" />
                  <input
                    type="text"
                    name="address"
                    value={address}
                    onChange={handleChange}
                    placeholder="Address"
                    required
                    className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Select Account Type
                </label>
                <select
                  name="role"
                  value={role}
                  onChange={handleChange}
                  className="block appearance-none w-full bg-white border border-orange-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-orange-500"
                >
                  <option value="customer">Customer</option>
                  <option value="restaurant_owner">Restaurant Owner</option>
                  <option value="delivery_person">Delivery Person</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-500 hover:text-orange-700 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;