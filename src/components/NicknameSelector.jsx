import { useState } from 'react'
import { nicknameMap } from '../auth/nicknames'

export const NicknameSelector = ({ onSelect, onClose }) => {
  const [selectedNickname, setSelectedNickname] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedNickname) {
      onSelect(selectedNickname)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border-2 border-green-500 p-6 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] max-w-md w-full">
        <h3 className="text-xl font-mono mb-4 text-green-400">&gt; SELECT_YOUR_NICKNAME</h3>
        <p className="text-green-500 font-mono mb-4 text-sm">
          Select your nickname to connect with your predictions.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {Object.entries(nicknameMap).map(([displayName, nickname]) => (
              <label key={nickname} className="flex items-center space-x-3 p-2 border border-green-500 rounded cursor-pointer hover:bg-green-500/10">
                <input
                  type="radio"
                  name="nickname"
                  value={nickname}
                  checked={selectedNickname === nickname}
                  onChange={(e) => setSelectedNickname(e.target.value)}
                  className="text-green-500 focus:ring-green-500"
                />
                <span className="text-green-500 font-mono">
                  {nickname} [{displayName}]
                </span>
              </label>
            ))}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-mono text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-black"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={!selectedNickname}
              className={`px-4 py-2 font-mono border rounded ${
                selectedNickname
                  ? 'text-green-500 border-green-500 hover:bg-green-500 hover:text-black'
                  : 'text-gray-500 border-gray-500 cursor-not-allowed'
              }`}
            >
              CONFIRM
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 