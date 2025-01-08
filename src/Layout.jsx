import { Link } from "wasp/client/router";
import { useAuth, logout } from "wasp/client/auth";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import "./Main.css";

export const Layout = () => {
  const { data: user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-stone-800 border-b border-stone-900 shadow-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/">
            <h1 className="text-2xl font-serif text-stone-100">Pickems</h1>
          </Link>
          { user ? (
            <div className="relative">
              <div className="flex items-center">
                <span className="px-3 py-1 bg-amber-500 text-stone-900 rounded-full font-bold mr-2">
                  🏆 {user.points} pts
                </span>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="px-3 py-1 font-serif text-stone-200 hover:text-stone-900 bg-stone-700 hover:bg-stone-600 rounded-lg transition-all duration-200 ease-in-out flex items-center"
                >
                  {user.identities.username?.id}
                  <svg className={`w-4 h-4 ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                  {user.isAdmin && (
                    <Link 
                      to="/admin" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-stone-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-stone-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-stone-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <span className="font-serif text-stone-200 hover:text-stone-400 transition-colors">
                Sign In
              </span>
            </Link>
          )}
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>
      {/* <footer className="border-t border-stone-300 mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <p className="text-center text-stone-500 font-serif">
            Pickems • xD
          </p>
        </div>
      </footer> */}
    </div>
  );
};