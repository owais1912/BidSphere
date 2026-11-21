import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const auctionApi = {
  getAuctions: (params) => api.get('/auctions', { params }),
  getFeatured: () => api.get('/auctions/featured'),
  getById: (id) => api.get(`/auctions/${id}`),
  create: (data) => api.post('/auctions', data),
  cancel: (id) => api.post(`/auctions/${id}/cancel`),
  acceptBid: (id) => api.post(`/auctions/${id}/accept-bid`),
  placeBid: (id, data) => api.post(`/auctions/${id}/bids`, data),
  getBids: (id) => api.get(`/auctions/${id}/bids`),
};

export const userApi = {
  getMe: () => api.get('/users/me'),
  getMyBids: () => api.get('/users/me/bids'),
  getMyListings: () => api.get('/users/me/listings'),
};

export const categoryApi = {
  getAll: () => api.get('/categories'),
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  updateUserStatus: (id, enabled) => api.put(`/admin/users/${id}/status`, { enabled }),
  getAuctions: () => api.get('/admin/auctions'),
  removeAuction: (id) => api.post(`/admin/auctions/${id}/remove`),
  closeExpiredAuctions: () => api.post('/admin/auctions/close-expired'),
};
