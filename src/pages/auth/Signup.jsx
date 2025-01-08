import React from "react";
import { Link } from "wasp/client/router";
import { SignupForm } from "wasp/client/auth";

export default function Signup() {
  return (
    <div className="w-full h-full bg-black">
      <div className="min-w-full min-h-[75vh] flex items-center justify-center">
        <div className="w-full h-full max-w-sm p-5 bg-black border border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] rounded">
          <div>
            <h1 className="text-2xl font-mono text-green-500 mb-6 text-center glitch-text">[NEW_USER_REGISTRATION]</h1>
            <SignupForm
              appearance={{
                colors: {
                  brand: '#22c55e',
                  brandAccent: '#16a34a',
                  submitButtonText: '#000000',
                }
              }}
            />
            <div className="mt-6 text-center font-mono text-green-500">
              [EXISTING_USER?] &gt;{" "}
              <Link to="/login" className="text-green-400 hover:text-green-300 underline">
                INITIALIZE_SESSION
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}