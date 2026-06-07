import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor to add Auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const hadToken = !!localStorage.getItem('auth_token');
      localStorage.removeItem('auth_token');
      // Only redirect to login if the user had a token that got rejected
      // (expired/invalidated session). Don't redirect guests hitting protected endpoints.
      if (hadToken && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ============ Admin Tour APIs ============
export const adminTourAPIs = {
  list: (params?: any) => api.get('/admin/tours', { params }),
  get: (id: number) => api.get(`/admin/tours/${id}`),
  create: (data: any) => {
    const formData = new FormData();
    
    // Add all fields
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (key === 'highlights' || key === 'essentials' || key === 'existing_gallery' || key === 'included_services' || key === 'excluded_services' || key === 'cancellation_policy') {
        if (Array.isArray(data[key])) {
          data[key].forEach((val: any) => {
            formData.append(`${key}[]`, String(val));
          });
        }
      } else if (key === 'gallery') {
        if (Array.isArray(data[key])) {
          data[key].forEach((file: File) => {
            if (file instanceof File) {
              formData.append(`gallery[]`, file);
            }
          });
        }
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, String(data[key]));
      }
    });

    return api.post('/admin/tours', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id: number, data: any) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (key === 'highlights' || key === 'essentials' || key === 'existing_gallery' || key === 'included_services' || key === 'excluded_services' || key === 'cancellation_policy') {
        if (Array.isArray(data[key])) {
          data[key].forEach((val: any) => {
            formData.append(`${key}[]`, String(val));
          });
        }
      } else if (key === 'gallery') {
        if (Array.isArray(data[key])) {
          data[key].forEach((file: File) => {
            if (file instanceof File) {
              formData.append(`gallery[]`, file);
            }
          });
        }
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, String(data[key]));
      }
    });

    formData.append('_method', 'PUT');

    return api.post(`/admin/tours/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id: number) => api.delete(`/admin/tours/${id}`),
  uploadImages: (id: number, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images[]', file));
    return api.post(`/admin/tours/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// ============ Admin Booking APIs ============
export const adminBookingAPIs = {
  list: (params?: any) => api.get('/admin/bookings', { params }),
  get: (id: number) => api.get(`/admin/bookings/${id}`),
  updateStatus: (id: number, status: string) => 
    api.put(`/admin/bookings/${id}/status`, { status }),
  updatePaymentStatus: (id: number, paymentStatus: string) =>
    api.put(`/admin/bookings/${id}/payment-status`, { payment_status: paymentStatus }),
  updateNotes: (id: number, adminNotes: string) =>
    api.put(`/admin/bookings/${id}/notes`, { admin_notes: adminNotes }),
  cancel: (id: number) => api.delete(`/admin/bookings/${id}`)
};

// ============ Admin Shop Order APIs ============
export const adminShopOrderAPIs = {
  updateStatus: (id: number, status: string) => 
    api.put(`/admin/shop/orders/${id}/status`, { status }),
  updatePaymentStatus: (id: number, paymentStatus: string) =>
    api.put(`/admin/shop/orders/${id}/payment-status`, { payment_status: paymentStatus }),
};

// ============ Admin User APIs ============
export const adminUserAPIs = {
  list: (params?: any) => api.get('/admin/users', { params }),
  get: (id: number) => api.get(`/admin/users/${id}`),
  update: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  updateRole: (id: number, role: string) => 
    api.put(`/admin/users/${id}/role`, { role }),
  delete: (id: number) => api.delete(`/admin/users/${id}`)
};

// ============ Review APIs ============
export const reviewAPIs = {
  list: (tourId: number) => api.get(`/tours/${tourId}/reviews`),
  create: (data: { tour_id: number; booking_id?: string | number | null; rating: number; comment: string }) => api.post('/reviews', data),
  // Admin methods
  adminList: (page = 1) => api.get(`/admin/reviews?page=${page}`),
  approve: (id: number) => api.post(`/admin/reviews/${id}/approve`),
  reply: (id: number, reply: string) => api.post(`/admin/reviews/${id}/reply`, { admin_reply: reply }),
  update: (id: number, comment: string) => api.put(`/admin/reviews/${id}`, { comment })
};

// ============ Loyalty & Promotion APIs ============
export const loyaltyAPIs = {
  // Public
  getPublicPromotions: (params?: any) => api.get('/promotions', { params }),
  
  // Ranks
  getRanks: () => api.get('/admin/ranks'),
  createRank: (data: any) => api.post('/admin/ranks', data),
  updateRank: (id: number, data: any) => api.put(`/admin/ranks/${id}`, data),
  deleteRank: (id: number) => api.delete(`/admin/ranks/${id}`),
  
  // Promotions
  getPromotions: () => api.get('/admin/promotions'),
  createPromotion: (data: any) => api.post('/admin/promotions', data),
  updatePromotion: (id: number, data: any) => api.put(`/admin/promotions/${id}`, data),
  deletePromotion: (id: number) => api.delete(`/admin/promotions/${id}`),
};

// ============ Payment Method APIs ============
export const paymentAPIs = {
  // Public
  getPublicPaymentMethods: () => api.get('/payment-methods'),
  
  // Admin
  getPaymentMethods: () => api.get('/admin/payment-methods'),
  createPaymentMethod: (data: any) => api.post('/admin/payment-methods', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updatePaymentMethod: (id: number, data: any) => {
    // When using multipart/form-data with PUT in Laravel, it often requires POST with _method=PUT
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post(`/admin/payment-methods/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`/admin/payment-methods/${id}`, data);
  },
  deletePaymentMethod: (id: number) => api.delete(`/admin/payment-methods/${id}`),
};

export const shopOrderAPIs = {
  pay: (id: number) => api.post(`/shop/orders/${id}/pay`),
  cancel: (id: number, cancel_reason: string) => api.delete(`/shop/orders/${id}/cancel`, { data: { cancel_reason } }),
  confirmReceived: (id: number) => api.post(`/shop/orders/${id}/confirm-received`),
};
