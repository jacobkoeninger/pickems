import React from "react";
import { Link } from "wasp/client/router";
import { LoginForm } from "wasp/client/auth";

export default function Login() {
  return (
    <div className="w-full h-full bg-black">
      <div className="min-w-full min-h-[75vh] flex items-center justify-center bg-[url('/matrix-bg.gif')] bg-cover bg-center">
        <div className="w-full h-full max-w-sm p-5 bg-black/80 border border-green-500 shadow-[0_0_20px_rgba(0,255,0,0.3)]">
          <div>
            <h1 className="text-3xl font-mono text-green-500 text-center mb-8 glitch-text">LOGIN</h1>
            <LoginForm
              appearance={{
                colors: {
                  brand: '#00ff00',
                  brandAccent: '#00cc00', 
                  submitButtonText: '#000000',
                }
              }}
            />
            <div className="mt-4 text-center font-mono text-green-400">
              [!] New user detected:{" "}
              <Link to="/signup" className="text-green-500 hover:text-green-300 underline decoration-dashed">
                INITIATE SIGNUP SEQUENCE
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}