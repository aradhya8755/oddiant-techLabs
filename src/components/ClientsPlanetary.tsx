"use client"
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clients } from '../data';

const ClientsPlanetary = () => {
  const [activeClientIndex, setActiveClientIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<number | null>(null);

  const handleNext = useCallback(() => {
    setActiveClientIndex((prev) => (prev + 1) % clients.length);
  }, []);

  const handlePrev = () => {
    setActiveClientIndex((prev) => (prev === 0 ? clients.length - 1 : prev - 1));
  };

  const handleClientClick = (index: number) => {
    setActiveClientIndex(index);
    // Reset auto-play timer when clicking
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      if (isAutoPlaying) {
        autoPlayRef.current = window.setInterval(handleNext, 4000);
      }
    }
  };

  // Toggle auto-play
  const toggleAutoPlay = () => {
    setIsAutoPlaying((prev) => !prev);
  };

  // Handle auto-play effect
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = window.setInterval(handleNext, 4000);
    } else if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, handleNext]);

  // Calculate positions for the surrounding client avatars
  const calculatePositions = (totalClients: number) => {
    const radius = 180; // Radius of the circle
    const positions = [];

    for (let i = 0; i < totalClients; i++) {
      // Calculate angle to distribute evenly around the circle (in radians)
      const angle = (i * 2 * Math.PI) / totalClients;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      positions.push({ x, y });
    }

    return positions;
  };

  // Precalculate positions
  const positions = calculatePositions(clients.length - 1); // -1 because one will be in the center

  return (
    <div className="bg-gray-100 py-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-blue-400 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-pink-400 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-purple-400 blur-3xl" />
        <div className="absolute bottom-1/3 left-2/3 w-40 h-40 rounded-full bg-indigo-400 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 text-center">Our Clients</h2>
          </div>
          <div className="flex justify-center mb-8">
          <button
            onClick={toggleAutoPlay}
            className={`px-4 py-2 rounded-full ${isAutoPlaying ? 'bg-purple-600' : 'bg-gray-500'} text-white transition-colors`}
          >
            {isAutoPlaying ? 'Auto-Play: On' : 'Auto-Play: Off'}
          </button>
        </div>
        <p className="text-xl text-center text-gray-600 mb-16">Trusted by the world's most innovative companies</p>

        <div className="relative h-[600px] w-full max-w-4xl mx-auto">
          {/* Center hub with pulsing effect */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center animate-pulse">
            <div className="w-56 h-56 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center" />
            </div>
          </div>

          {/* Featured client in center */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`center-${activeClientIndex}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
            >
              <div className="relative">
                <div className="p-2 bg-white rounded-full shadow-lg">
                  <img
                    src={clients[activeClientIndex].avatar}
                    alt={clients[activeClientIndex].name}
                    className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-full border-4 border-white shadow-[0_0_30px_rgba(147,51,234,0.3)]"
                  />
                </div>
                <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 bg-white shadow-md px-6 py-3 rounded-xl text-center">
                  <div className="text-lg font-bold text-gray-800">{clients[activeClientIndex].name}</div>
                  <div className="text-sm text-gray-600">{clients[activeClientIndex].position}</div>
                  <div className="text-xs text-purple-600 font-medium">{clients[activeClientIndex].company}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Surrounding clients */}
          {clients.map((client, index) => {
            // Skip the active client (it's displayed in the center)
            if (index === activeClientIndex) return null;

            // Determine position index by adjusting for the missing active client
            let positionIndex = index;
            if (index > activeClientIndex) positionIndex--;

            const position = positions[positionIndex % positions.length];

            return (
              <motion.div
                key={client.id}
                initial={false}
                animate={{
                  x: position.x,
                  y: position.y,
                  scale: 0.5 + Math.random() * 0.2 // Varying sizes for visual interest
                }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 30,
                  duration: 0.5
                }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
                onClick={() => handleClientClick(index)}
              >
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={client.avatar}
                    alt={client.name}
                    className="rounded-full border-2 border-white shadow-lg w-14 h-14 object-cover"
                  />
                  <div className="opacity-0 hover:opacity-100 absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-white shadow-md px-3 py-2 rounded-md text-center whitespace-nowrap transition-opacity duration-300">
                    <div className="text-xs font-bold text-gray-800">{client.name}</div>
                    <div className="text-xs text-gray-600">{client.position}</div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}

          {/* Navigation buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 bg-white hover:bg-gray-100 rounded-full p-3 text-gray-700 shadow-lg z-40"
            aria-label="Previous client"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 bg-white hover:bg-gray-100 rounded-full p-3 text-gray-700 shadow-lg z-40"
            aria-label="Next client"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Navigation dots */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-2 justify-center">
            {clients.map((client, index) => (
              <button
                key={`dot-${client.id}`}
                onClick={() => handleClientClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeClientIndex === index
                    ? 'bg-purple-500 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to client ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsPlanetary;
