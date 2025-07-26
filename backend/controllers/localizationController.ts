// backend/controllers/localizationController.ts;
import { Request, Response    } from 'express';
import axios from 'axios';
//  A map to associate country codes with language and currency information.;
const localeMap: { [key: string]: { lang: string,;
  currency: string,;
  name: string} } = {
    'BD': { lang: 'bn', currency: 'BDT', name: '৳' }, //  Bangladesh to Bengali, BDT, and Bengali Taka symbol
    'US': { lang: 'en', currency: 'USD', name: '$' }, //  USA to English, USD, and Dollar symbol
    'CA': { lang: 'en', currency: 'CAD', name: 'CAD' }, //  Canada defaults to English now
    'GB': { lang: 'en', currency: 'GBP', name: 'GBP' }, //  UK defaults to English
    'AU': { lang: 'en', currency: 'AUD', name: 'AUD' }  //  Australia defaults to English
};
export const detectLocale: async ($1) => { try {
const ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const testIp: ip === '::1' ? '8.8.8.8' : ip
};
        const geoResponse: await axios.get(`http: //ip-api.com/json/${testIp}```