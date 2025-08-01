"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
class TwoCheckoutService {
    constructor() {
        this.apiUrl = process.env.TWOCHECKOUT_SANDBOX === 'true'
            ? 'https://api.2checkout.com/rest/6.0/'
            : 'https://api.2checkout.com/rest/6.0/';
        this.merchantCode = process.env.TWOCHECKOUT_MERCHANT_CODE || '';
        this.secretKey = process.env.TWOCHECKOUT_SECRET_KEY || '';
        this.buyLinkSecretWord = process.env.TWOCHECKOUT_BUY_LINK_SECRET_WORD || '';
    }
    getAuthHeaders() {
        const timestamp = Math.floor(Date.now() / 1000);
        const stringToSign = `${this.merchantCode}${timestamp}`;
        const hash = crypto_1.default.createHmac('sha256', this.secretKey).update(stringToSign).digest('hex');
        return {
            'X-Avangate-Authentication': `code="${this.merchantCode}" date="${timestamp}" hash="${hash}"`,
            'Content-Type': 'application/json'
        };
    }
    async createSubscription(subscriptionData) {
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
            const response = await axios_1.default.post(`${this.apiUrl}orders/`, payload, { headers: this.getAuthHeaders() });
            return {
                success: true,
                data: response.data,
                paymentUrl: response.data.PaymentDetails?.PaymentURL
            };
        }
        catch (error) {
            console.error('2Checkout subscription creation error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create subscription'
            };
        }
    }
    generateBuyLink(params) {
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
        const stringToSign = queryParams.toString();
        const signature = crypto_1.default
            .createHmac('sha256', this.buyLinkSecretWord)
            .update(stringToSign)
            .digest('hex');
        queryParams.append('signature', signature);
        return `${baseUrl}?${queryParams.toString()}`;
    }
    verifyIPN(ipnData, signature) {
        try {
            const stringToSign = Object.keys(ipnData)
                .sort()
                .map(key => `${key}=${ipnData[key]}`)
                .join('&');
            const expectedSignature = crypto_1.default
                .createHmac('sha256', this.secretKey)
                .update(stringToSign)
                .digest('hex');
            return signature === expectedSignature;
        }
        catch (error) {
            console.error('IPN verification error:', error);
            return false;
        }
    }
    async getSubscription(subscriptionId) {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}subscriptions/${subscriptionId}/`, { headers: this.getAuthHeaders() });
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            console.error('Get subscription error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to get subscription'
            };
        }
    }
    async cancelSubscription(subscriptionId) {
        try {
            const response = await axios_1.default.delete(`${this.apiUrl}subscriptions/${subscriptionId}/`, { headers: this.getAuthHeaders() });
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            console.error('Cancel subscription error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to cancel subscription'
            };
        }
    }
    async updateSubscription(subscriptionId, updateData) {
        try {
            const response = await axios_1.default.put(`${this.apiUrl}subscriptions/${subscriptionId}/`, updateData, { headers: this.getAuthHeaders() });
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            console.error('Update subscription error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to update subscription'
            };
        }
    }
    async getCustomerSubscriptions(customerEmail) {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}subscriptions/`, {
                headers: this.getAuthHeaders(),
                params: { CustomerEmail: customerEmail }
            });
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) {
            console.error('Get customer subscriptions error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to get customer subscriptions'
            };
        }
    }
}
exports.default = new TwoCheckoutService();
