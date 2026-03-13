import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-green-600">SafeRoute</span>
            </Link>
          </div>
          <div className="flex items-center">
            {token ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-4 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-4 bg-green-600 text-white hover:bg-green-700 px-3 py-2 rounded-md font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
