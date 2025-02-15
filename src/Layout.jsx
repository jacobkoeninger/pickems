import { Link } from "wasp/client/router";
import { useAuth, logout } from "wasp/client/auth";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { setUserNickname, applyNickname } from './auth/nicknames';
import { NicknameSelector } from './components/NicknameSelector';
import "./Main.css";

export const Layout = () => {
  const { data: user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNicknameSelector, setShowNicknameSelector] = useState(false);

  useEffect(() => {
    const checkNickname = async () => {
      if (user && !user.nickname) {
        const result = await setUserNickname(user, window.wasp.api.internal)
        if (result.needsManualSelection) {
          setShowNicknameSelector(true)
        }
      }
    }
    checkNickname()
  }, [user])

  const handleNicknameSelect = async (nickname) => {
    const result = await applyNickname(user.id, nickname, window.wasp.api.internal)
    if (result.success) {
      setShowNicknameSelector(false)
      // Force reload to update user data
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-500">
      {showNicknameSelector && (
        <NicknameSelector 
          onSelect={handleNicknameSelect}
          onClose={() => setShowNicknameSelector(false)}
        />
      )}

      <header className="bg-black border-b border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/">
            <h1 className="text-2xl font-mono text-green-500 hover:text-green-400 glitch-text">[PICKEMS]</h1>
          </Link>
          { user ? (
            <div className="relative">
              <div className="flex items-center">
                <span className="px-3 py-1 bg-green-500 text-black rounded font-mono mr-2 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                  ⚡ {user.points} pts
                </span>
                {user.nickname && (
                  <span className="px-3 py-1 border border-green-500 text-green-500 rounded font-mono mr-2">
                    [{user.nickname}]
                  </span>
                )}
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="px-3 py-1 font-mono text-green-500 hover:text-black border border-green-500 hover:bg-green-500 rounded transition-all duration-200 ease-in-out flex items-center hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                >
                  {user.avatarUrl && (
                    <img 
                      src={user.avatarUrl} 
                      alt=""
                      className="w-6 h-6 rounded-full mr-2"
                    />
                  )}
                  <span className="mr-1">&gt;</span>{user.username}
                  <svg className={`w-4 h-4 ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black border border-green-500 rounded shadow-[0_0_15px_rgba(34,197,94,0.3)] py-1 z-10">
                  {user.isAdmin && (
                    <Link 
                      to="/admin" 
                      className="block px-4 py-2 text-sm font-mono text-green-500 hover:bg-green-500 hover:text-black"
                      onClick={() => setDropdownOpen(false)}
                    >
                      &gt; Admin_Console
                    </Link>
                  )}
                  <Link
                    to="/"
                    className="block px-4 py-2 text-sm font-mono text-green-500 hover:bg-green-500 hover:text-black"
                    onClick={() => setDropdownOpen(false)}
                  >
                    &gt; Prototype_v2
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm font-mono text-green-500 hover:bg-green-500 hover:text-black"
                    onClick={() => setDropdownOpen(false)}
                  >
                    &gt; Config
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-mono text-green-500 hover:bg-green-500 hover:text-black"
                  >
                    &gt; Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <span className="font-mono text-green-500 hover:text-green-400 transition-colors">
                &gt; Initialize_Session
              </span>
            </Link>
          )}
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>
      {/* <footer className="border-t border-green-500 mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <p className="text-center text-green-500 font-mono">
            [PICKEMS] :: SYSTEM_ACTIVE
          </p>
        </div>
      </footer> */}
    </div>
  );
};