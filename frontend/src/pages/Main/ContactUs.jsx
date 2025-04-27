import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaSpinner } from 'react-icons/fa';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';
import axios from 'axios';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const contactInfo = [
    {
      icon: <FaPhone />,
      title: 'Phone',
      details: ['+94 11 234 5678', '+94 76 123 4567']
    },
    {
      icon: <FaEnvelope />,
      title: 'Email',
      details: ['support@digidine.com', 'info@digidine.com']
    },
    {
      icon: <FaMapMarkerAlt />,
      title: 'Location',
      details: ['123 Main Street', 'Colombo, Sri Lanka']
    },
    {
      icon: <FaClock />,
      title: 'Business Hours',
      details: ['Mon - Fri: 9:00 AM - 10:00 PM', 'Sat - Sun: 10:00 AM - 11:00 PM']
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    
    // Name validation
    if (formData.name.trim().length < 2) {
      setErrorMessage('Name must be at least 2 characters long');
      return false;
    }
    
    // Subject validation
    if (formData.subject.trim().length < 3) {
      setErrorMessage('Subject must be at least 3 characters long');
      return false;
    }
    
    // Message validation
    if (formData.message.trim().length < 10) {
      setErrorMessage('Message must be at least 10 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error message
    setErrorMessage('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Make actual API call to backend
      const response = await axios.post('http://localhost:5000/api/contact/submit', formData);
      
      // Check for successful response
      if (response.data.success) {
        setSubmitStatus('success');
        // Reset form fields
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        // Handle unexpected success response structure
        setSubmitStatus('error');
        setErrorMessage(response.data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      
      // Extract error message from response if available
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || 'Failed to send message. Please try again.');
      } else {
        setErrorMessage('Network error. Please check your connection and try again.');
      }
      
      console.error('Contact form submission error:', error);
    } finally {
      setIsSubmitting(false);
      // Reset status after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
        setErrorMessage('');
      }, 5000);
    }
  };

  return (
    <>
      <Header />
      <div> {/* Padding for fixed header */}
        {/* Hero Section */}
        <section className="relative h-[300px] bg-orange-500">
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
            <div className="text-center">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Contact Us
              </motion.h1>
              <motion.p 
                className="text-xl text-white/90 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                We'd love to hear from you. Get in touch with us!
              </motion.p>
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-sm text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-3xl text-orange-500 mb-4 flex justify-center">
                    {info.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{info.title}</h3>
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-gray-600">{detail}</p>
                  ))}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                      Your Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Your message here..."
                  ></textarea>
                </div>
                
                {/* Error Message */}
                {errorMessage && (
                  <div className="p-4 bg-red-100 text-red-700 rounded-md">
                    {errorMessage}
                  </div>
                )}
                
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-orange-500 text-white py-3 px-6 rounded-md font-medium 
                      ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-600'} 
                      transition duration-300 flex items-center justify-center`}
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Sending...
                      </>
                    ) : 'Send Message'}
                  </button>
                </div>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-100 text-green-700 rounded-md"
                  >
                    <p className="font-medium">Thank you! Your message has been sent successfully.</p>
                    <p className="text-sm mt-1">We'll get back to you as soon as possible.</p>
                  </motion.div>
                )}
                {submitStatus === 'error' && !errorMessage && (
                  <div className="p-4 bg-red-100 text-red-700 rounded-md">
                    Oops! Something went wrong. Please try again later.
                  </div>
                )}
              </motion.form>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="h-[400px] bg-gray-100">
          {/* Add your map component here */}
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <p className="text-gray-600">Map will be integrated here</p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default ContactUs;