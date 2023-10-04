import { userEvents } from './events';

export async function apiCall(endpoint, options) {
    const response = await fetch(endpoint, options);
    if (response.status === 401) { // Unauthorized
        userEvents.emit('logoutRequired');
    }
    return response.json();
}

export function logoutUser() {
    userEvents.emit('logoutRequired');
}
