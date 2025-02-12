import { nicknameMap } from './nicknames.js'

export const getConfig = () => {
    if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
        console.error("Error: Missing Discord OAuth environment variables. Ensure DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET are set in your .env file.");
        throw new Error('Missing Discord OAuth env variables');
    }

    return {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        scope: ['identify'],
    }
}

// Return the fields for user signup
export const userSignupFields = {
    username: (data) => data.profile.username,
    displayName: (data) => data.profile.global_name || data.profile.username,
    avatarUrl: (data) => data.profile.avatar ? 
        `https://cdn.discordapp.com/avatars/${data.profile.id}/${data.profile.avatar}.png` : 
        null,
    nickname: (data) => nicknameMap[data.profile.global_name || data.profile.username] || null,
    isAdmin: () => false
}