"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntent = exports.getSearchSuggestions = exports.searchIntegrations = exports.deleteIntegration = exports.getIntegrations = void 0;
const getIntegrations = async (req, res) => {
    res.json({ success: true, data: [] });
};
exports.getIntegrations = getIntegrations;
const deleteIntegration = async (req, res) => {
    res.json({ success: true, data: {} });
};
exports.deleteIntegration = deleteIntegration;
const searchIntegrations = async (req, res) => {
    res.json({ success: true, data: [] });
};
exports.searchIntegrations = searchIntegrations;
const getSearchSuggestions = async (req, res) => {
    res.json({ success: true, data: [] });
};
exports.getSearchSuggestions = getSearchSuggestions;
const createPaymentIntent = async (req, res) => {
    res.json({ success: true, data: { clientSecret: 'pi_123' } });
};
exports.createPaymentIntent = createPaymentIntent;
