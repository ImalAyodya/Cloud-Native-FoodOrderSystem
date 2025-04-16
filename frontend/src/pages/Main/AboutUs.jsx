
import React from 'react';
import { motion } from 'framer-motion';
import { FaUtensils, FaUsers, FaTruck, FaHeart } from 'react-icons/fa';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';

const AboutUs = () => {
  const stats = [
    { icon: <FaUtensils />, number: "1000+", label: "Restaurants" },
    { icon: <FaUsers />, number: "50000+", label: "Happy Customers" },
    { icon: <FaTruck />, number: "500+", label: "Delivery Partners" },
    { icon: <FaHeart />, number: "100K+", label: "Orders Delivered" },
  ];

  const teamMembers = [
    {
      name: "Imal Ayodya",
      role: "Full Stack Developer",
    },
    {
      name: "Sithmaka Nanayakkara",
      role: "Full Stack Developer",
    },
    {
      name: "Juthmini Abesiri Gunawardhana",
      role: "Full Stack Developer",
    },
    {
      name: "Sewmi",
      role: "Full Stack Developer",
    }
  ];

  return (
    <>
      <Header />
      <div> {/* Padding for fixed header */}
        {/* Hero Section */}
        <section className="relative h-[400px] bg-orange-500">
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
            <div className="text-center">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                About DigiDine
              </motion.h1>
              <motion.p 
                className="text-xl text-white/90 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Bringing the finest dining experiences to your doorstep since 2023
              </motion.p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                DigiDine was born from a simple idea: to make quality food accessible to everyone. 
                What started as a small startup in 2023 has grown into a platform that connects 
                thousands of restaurants with food lovers across the country.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our mission is to transform the way people think about food delivery. We believe 
                that great food should be just a click away, without compromising on quality or service.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-3xl text-orange-500 mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold mb-1">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}

        <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
                <motion.div 
                key={index}
                className="text-center bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                >
                <div className="mb-4 relative w-20 h-20 mx-auto bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-white font-bold">
                    {member.name.charAt(0)}
                    </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
                </motion.div>
            ))}
            </div>
        </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div 
                className="text-center p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl text-orange-500 mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-2">Excellence</h3>
                <p className="text-gray-600">
                  We strive for excellence in every order, ensuring the highest quality 
                  food and service.
                </p>
              </motion.div>

              <motion.div 
                className="text-center p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl text-orange-500 mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-2">Speed</h3>
                <p className="text-gray-600">
                  Quick delivery without compromising on the quality of food or service.
                </p>
              </motion.div>

              <motion.div 
                className="text-center p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl text-orange-500 mb-4">💝</div>
                <h3 className="text-xl font-bold mb-2">Customer First</h3>
                <p className="text-gray-600">
                  Your satisfaction is our top priority. We're here to serve you better.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="py-16 bg-orange-500">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust DigiDine for their food delivery needs.
            </p>
            <button className="bg-white text-orange-500 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition duration-300">
              Contact Us
            </button>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs;