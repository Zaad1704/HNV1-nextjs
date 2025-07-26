import apiClient from '@/lib/api';

export const testUserDeletion = async (userId: string) => {
  try {
    console.log('Testing user deletion for ID:', userId);
    
    const response = await apiClient.delete(`/super-admin/users/${userId}`);
    
    console.log('Delete response:', response.data);
    
    if (response.data.success) {
      console.log('✅ User deletion successful');
      return { success: true, message: response.data.message };
    } else {
      console.log('❌ User deletion failed:', response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error: any) {
    console.error('❌ User deletion error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'Unknown error' 
    };
  }
};

export const debugApiCall = async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any) => {
  try {
    console.log(`🔍 Testing ${method} ${endpoint}`);
    
    let response;
    switch (method) {
      case 'GET':
        response = await apiClient.get(endpoint);
        break;
      case 'POST':
        response = await apiClient.post(endpoint, data);
        break;
      case 'PUT':
        response = await apiClient.put(endpoint, data);
        break;
      case 'DELETE':
        response = await apiClient.delete(endpoint);
        break;
    }
    
    console.log('✅ API Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ API Error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};