import { nicknameMap } from './nicknames.js'

const validateEnvVars = () => {
    const required = ['DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET', 'DATABASE_URL'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

export const getConfig = () => {
    validateEnvVars();

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
    isAdmin: (data) => {
        // Allow configuring initial admin user by Discord username
        const adminUsername = process.env.INITIAL_ADMIN_USERNAME;
        if (adminUsername && data.profile.username === adminUsername) {
            return true;
        }
        return false;
    }
}