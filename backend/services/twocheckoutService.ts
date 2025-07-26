import axios from 'axios';
import crypto from 'crypto';

class TwoCheckoutService {
  private apiUrl: string;
  private merchantCode: string;
  private secretKey: string;
  private buyLinkSecretWord: string;

  constructor() {
    this.apiUrl = process.env.TWOCHECKOUT_SANDBOX === 'true' 
      ? 'https://api.2checkout.com/rest/6.0/' 
      : 'https://api.2checkout.com/rest/6.0/';
    this.merchantCode = process.env.TWOCHECKOUT_MERCHANT_CODE || '';
    this.secretKey = process.env.TWOCHECKOUT_SECRET_KEY || '';
    this.buyLinkSecretWord = process.env.TWOCHECKOUT_BUY_LINK_SECRET_WORD || '';
  }

  // Generate authentication headers
  private getAuthHeaders() {
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `${this.merchantCode}${timestamp}`;
    const hash = crypto.createHmac('sha256', this.secretKey).update(stringToSign).digest('hex');

    return {
      'X-Avangate-Authentication': `code="${this.merchantCode}" date="${timestamp}" hash="${hash}"`,
      'Content-Type': 'application/json'
    };
  }

  // Create a subscription
  async createSubscription(subscriptionData: {
    customerEmail: string;
    customerName: string;
    productId: string;
    quantity: number;
    currency: string;
    billingCycle: string;
    returnUrl: string;
    cancelUrl: string;
  }) {
    try {
      const payload = {
        Currency: subscriptionData.currency,
        Language: 'en',
        Country: 'US',
        CustomerIP: '127.0.0.1',
        ExternalReference: `sub_${Date.now()}`,
        Source: 'HNV_PROPERTY_MANAGEMENT',
        BillingDetails: {
          FirstName: subscriptionData.customerName.split(' ')[0] || 'Customer',
          LastName: subscriptionData.customerName.split(' ')[1] || 'User',
          Email: subscriptionData.customerEmail,
          Country: 'US'
        },
        DeliveryDetails: {
          FirstName: subscriptionData.customerName.split(' ')[0] || 'Customer',
          LastName: subscriptionData.customerName.split(' ')[1] || 'User',
          Email: subscriptionData.customerEmail,
          Country: 'US'
        },
        Items: [{
          Code: subscriptionData.productId,
          Quantity: subscriptionData.quantity,
          PriceOptions: [{
            Name: 'BILLING_CYCLE',
            Value: subscriptionData.billingCycle.toUpperCase()
          }]
        }],
        PaymentDetails: {
          Type: 'CC',
          Currency: subscriptionData.currency
        }
      };

      const response = await axios.post(
        `${this.apiUrl}orders/`,
        payload,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        data: response.data,
        paymentUrl: response.data.PaymentDetails?.PaymentURL
      };
    } catch (error: any) {
      console.error('2Checkout subscription creation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create subscription'
      };
    }
  }

  // Generate Buy Link for direct checkout
  generateBuyLink(params: {
    productId: string;
    customerEmail: string;
    customerName: string;
    currency: string;
    returnUrl: string;
    cancelUrl: string;
    externalReference: string;
  }) {
    const baseUrl = process.env.TWOCHECKOUT_SANDBOX === 'true' 
      ? 'https://secure.2checkout.com/checkout/buy'
      : 'https://secure.2checkout.com/checkout/buy';

    const queryParams = new URLSearchParams({
      'merchant-id': this.merchantCode,
      'product-id': params.productId,
      'customer-email': params.customerEmail,
      'customer-name': params.customerName,
      'currency': params.currency,
      'return-url': params.returnUrl,
      'cancel-url': params.cancelUrl,
      'external-reference': params.externalReference,
      'language': 'en'
    });

    // Generate signature for security
    const stringToSign = queryParams.toString();
    const signature = crypto
      .createHmac('sha256', this.buyLinkSecretWord)
      .update(stringToSign)
      .digest('hex');

    queryParams.append('signature', signature);

    return `${baseUrl}?${queryParams.toString()}`;
  }

  // Verify IPN (Instant Payment Notification)
  verifyIPN(ipnData: any, signature: string): boolean {
    try {
      // Create string to sign from IPN data
      const stringToSign = Object.keys(ipnData)
        .sort()
        .map(key => `${key}=${ipnData[key]}`)
        .join('&');

      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(stringToSign)
        .digest('hex');

      return signature === expectedSignature;
    } catch (error) {
      console.error('IPN verification error:', error);
      return false;
    }
  }

  // Get subscription details
  async getSubscription(subscriptionId: string) {
    try {
      const response = await axios.get(
        `${this.apiUrl}subscriptions/${subscriptionId}/`,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Get subscription error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get subscription'
      };
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string) {
    try {
      const response = await axios.delete(
        `${this.apiUrl}subscriptions/${subscriptionId}/`,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Cancel subscription error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel subscription'
      };
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId: string, updateData: any) {
    try {
      const response = await axios.put(
        `${this.apiUrl}subscriptions/${subscriptionId}/`,
        updateData,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Update subscription error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update subscription'
      };
    }
  }

  // Get customer subscriptions
  async getCustomerSubscriptions(customerEmail: string) {
    try {
      const response = await axios.get(
        `${this.apiUrl}subscriptions/`,
        { 
          headers: this.getAuthHeaders(),
          params: { CustomerEmail: customerEmail }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Get customer subscriptions error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get customer subscriptions'
      };
    }
  }
}

export default new TwoCheckoutService();