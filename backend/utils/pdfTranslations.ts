// PDF Translation utilities
export const pdfTranslations = {
  en: {
    paymentReceipt: 'PAYMENT RECEIPT',
    receiptInformation: 'Receipt Information',
    receiptNumber: 'Receipt #',
    manualNumber: 'Manual #',
    date: 'Date',
    tenantDetails: 'Tenant Details',
    name: 'Name',
    property: 'Property',
    unit: 'Unit',
    month: 'Month',
    method: 'Method',
    amountPaid: 'AMOUNT PAID',
    status: 'Status',
    paid: 'PAID',
    verified: '✓ Verified',
    poweredBy: 'Powered by HNV Property Management Solutions',
    allRightsReserved: 'All rights reserved',
    confidentialNotice: 'This document contains confidential payment information. Please retain for your records.',
    thankYou: 'Thank you for your payment!',
    rentMonth: 'Rent Month',
    paymentMethod: 'Payment Method',
    amount: 'Amount'
  },
  es: {
    paymentReceipt: 'RECIBO DE PAGO',
    receiptInformation: 'Información del Recibo',
    receiptNumber: 'Recibo #',
    manualNumber: 'Manual #',
    date: 'Fecha',
    tenantDetails: 'Detalles del Inquilino',
    name: 'Nombre',
    property: 'Propiedad',
    unit: 'Unidad',
    month: 'Mes',
    method: 'Método',
    amountPaid: 'CANTIDAD PAGADA',
    status: 'Estado',
    paid: 'PAGADO',
    verified: '✓ Verificado',
    poweredBy: 'Desarrollado por HNV Property Management Solutions',
    allRightsReserved: 'Todos los derechos reservados',
    confidentialNotice: 'Este documento contiene información confidencial de pago. Por favor conserve para sus registros.',
    thankYou: '¡Gracias por su pago!',
    rentMonth: 'Mes de Alquiler',
    paymentMethod: 'Método de Pago',
    amount: 'Cantidad'
  },
  fr: {
    paymentReceipt: 'REÇU DE PAIEMENT',
    receiptInformation: 'Informations du Reçu',
    receiptNumber: 'Reçu #',
    manualNumber: 'Manuel #',
    date: 'Date',
    tenantDetails: 'Détails du Locataire',
    name: 'Nom',
    property: 'Propriété',
    unit: 'Unité',
    month: 'Mois',
    method: 'Méthode',
    amountPaid: 'MONTANT PAYÉ',
    status: 'Statut',
    paid: 'PAYÉ',
    verified: '✓ Vérifié',
    poweredBy: 'Alimenté par HNV Property Management Solutions',
    allRightsReserved: 'Tous droits réservés',
    confidentialNotice: 'Ce document contient des informations de paiement confidentielles. Veuillez conserver pour vos dossiers.',
    thankYou: 'Merci pour votre paiement!',
    rentMonth: 'Mois de Loyer',
    paymentMethod: 'Méthode de Paiement',
    amount: 'Montant'
  },
  ar: {
    paymentReceipt: 'إيصال الدفع',
    receiptInformation: 'معلومات الإيصال',
    receiptNumber: 'رقم الإيصال',
    manualNumber: 'رقم يدوي',
    date: 'التاريخ',
    tenantDetails: 'تفاصيل المستأجر',
    name: 'الاسم',
    property: 'العقار',
    unit: 'الوحدة',
    month: 'الشهر',
    method: 'الطريقة',
    amountPaid: 'المبلغ المدفوع',
    status: 'الحالة',
    paid: 'مدفوع',
    verified: '✓ تم التحقق',
    poweredBy: 'مدعوم من HNV Property Management Solutions',
    allRightsReserved: 'جميع الحقوق محفوظة',
    confidentialNotice: 'تحتوي هذه الوثيقة على معلومات دفع سرية. يرجى الاحتفاظ بها لسجلاتك.',
    thankYou: 'شكراً لك على الدفع!',
    rentMonth: 'شهر الإيجار',
    paymentMethod: 'طريقة الدفع',
    amount: 'المبلغ'
  }
};

export const getTranslation = (language: string, key: string): string => {
  const lang = language.toLowerCase();
  const translations = pdfTranslations[lang as keyof typeof pdfTranslations] || pdfTranslations.en;
  return translations[key as keyof typeof translations] || pdfTranslations.en[key as keyof typeof pdfTranslations.en] || key;
};

export const isRTL = (language: string): boolean => {
  return ['ar', 'he', 'fa', 'ur'].includes(language.toLowerCase());
};