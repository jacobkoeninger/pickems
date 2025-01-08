export const userSignupFields = {
    username: (data) => data.profile.global_name,
    displayName: (data) => data.profile.global_name || data.profile.username,
    avatarUrl: (data) => data.profile.avatar,
}

export function getConfig() {
    return {
        scopes: ['identify'],
    }
}