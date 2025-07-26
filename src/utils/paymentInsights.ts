// Generate AI insights based on payment data
export const generatePaymentInsights = (payment: any) => {
  if (!payment) return [];
  
  const insights = [];
  
  // Payment timing insight
  const paymentDate = new Date(payment.paymentDate);
  const dayOfMonth = paymentDate.getDate();
  
  if (dayOfMonth <= 5) {
    insights.push({
      title: 'Early Payment',
      description: 'This payment was made early in the month, indicating good tenant reliability.',
      type: 'positive'
    });
  } else if (dayOfMonth >= 10) {
    insights.push({
      title: 'Late Payment',
      description: 'This payment was made after the 10th of the month. Consider setting up automatic reminders.',
      type: 'warning'
    });
  }
  
  // Payment method insight
  if (payment.paymentMethod === 'Cash') {
    insights.push({
      title: 'Cash Payment',
      description: 'Consider encouraging electronic payments for better tracking and security.',
      type: 'suggestion'
    });
  } else if (payment.paymentMethod === 'Bank Transfer' || payment.paymentMethod === 'Direct Deposit') {
    insights.push({
      title: 'Electronic Payment',
      description: 'Electronic payments help maintain good records and reduce manual processing.',
      type: 'positive'
    });
  }
  
  return insights;
};

// Generate smart suggestions based on payment data
export const generatePaymentSuggestions = (payment: any) => {
  if (!payment) return [];
  
  const suggestions = [];
  
  // Receipt suggestion
  suggestions.push({
    title: 'Send Receipt',
    description: 'Send an electronic receipt to the tenant for their records.',
    action: 'Send Receipt',
    icon: 'Send'
  });
  
  // Thank you message suggestion
  suggestions.push({
    title: 'Send Thank You',
    description: 'Send a thank you message to acknowledge the payment.',
    action: 'Send Message',
    icon: 'MessageCircle'
  });
  
  // Payment method suggestion
  if (payment.paymentMethod === 'Cash') {
    suggestions.push({
      title: 'Suggest Auto-Pay',
      description: 'Recommend setting up automatic payments for future transactions.',
      action: 'Setup Auto-Pay',
      icon: 'CreditCard'
    });
  }
  
  return suggestions;
};