// src/services/contactService.js
// Dedicated Contact API service

import axios from 'axios'

// Create a simple axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('activation_auth_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const contactService = {
    async getClientContacts(clientId) {
        console.log('contactService: Getting contacts for client', clientId)
        const response = await api.get(`/client-contacts/by-client/${clientId}`)
        return response.data
    },

    async createContact(contactData) {
        console.log('contactService: Creating contact', contactData)
        const response = await api.post('/client-contacts/with-user', contactData)
        return response.data
    },

    async updateContact(contactId, contactData) {
        console.log('contactService: Updating contact', contactId, contactData)
        const response = await api.put(`/client-contacts/${contactId}`, contactData)
        return response.data
    },

    async deleteContact(contactId) {
        console.log('contactService: Deleting contact', contactId)
        const response = await api.delete(`/client-contacts/${contactId}`)
        return response.data
    },

    async setPrimaryContact(contactId) {
        console.log('contactService: Setting primary contact', contactId)
        const response = await api.post(`/client-contacts/${contactId}/set-primary`)
        return response.data
    },

    async getPrimaryContact(clientId) {
        console.log('contactService: Getting primary contact for client', clientId)
        const response = await api.get(`/client-contacts/primary/${clientId}`)
        return response.data
    },

    async searchContacts(clientId, searchTerm) {
        console.log('contactService: Searching contacts for client', clientId, 'term:', searchTerm)
        const response = await api.get(`/client-contacts/search/${clientId}?q=${encodeURIComponent(searchTerm)}`)
        return response.data
    }
}