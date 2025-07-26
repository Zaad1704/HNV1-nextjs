const fs = require('fs');
const path = require('path');

// Base English translations
const baseTranslations = JSON.parse(fs.readFileSync('/workspaces/HNV1/frontend/public/locales/en/translation.json', 'utf8'));

// Language mappings with basic translations
const languageTranslations = {
  'zh': {
    'app_name': 'HNV物业管理解决方案',
    'nav.home': '首页',
    'nav.about': '关于',
    'nav.features': '功能',
    'nav.pricing': '价格',
    'nav.contact': '联系',
    'nav.login': '登录',
    'header.login': '登录',
    'header.get_started': '开始使用',
    'common.loading': '加载中...',
    'common.save': '保存',
    'common.cancel': '取消',
    'dashboard.overview': '概览',
    'dashboard.properties': '物业',
    'dashboard.tenants': '租户'
  },
  'ja': {
    'app_name': 'HNV不動産管理ソリューション',
    'nav.home': 'ホーム',
    'nav.about': '会社概要',
    'nav.features': '機能',
    'nav.pricing': '料金',
    'nav.contact': 'お問い合わせ',
    'nav.login': 'ログイン',
    'header.login': 'ログイン',
    'header.get_started': '始める',
    'common.loading': '読み込み中...',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'dashboard.overview': '概要',
    'dashboard.properties': '物件',
    'dashboard.tenants': 'テナント'
  },
  'ko': {
    'app_name': 'HNV부동산 관리 솔루션',
    'nav.home': '홈',
    'nav.about': '회사소개',
    'nav.features': '기능',
    'nav.pricing': '가격',
    'nav.contact': '연락처',
    'nav.login': '로그인',
    'header.login': '로그인',
    'header.get_started': '시작하기',
    'common.loading': '로딩 중...',
    'common.save': '저장',
    'common.cancel': '취소',
    'dashboard.overview': '개요',
    'dashboard.properties': '부동산',
    'dashboard.tenants': '임차인'
  },
  'hi': {
    'app_name': 'HNV संपत्ति प्रबंधन समाधान',
    'nav.home': 'होम',
    'nav.about': 'हमारे बारे में',
    'nav.features': 'विशेषताएं',
    'nav.pricing': 'मूल्य निर्धारण',
    'nav.contact': 'संपर्क',
    'nav.login': 'लॉग इन',
    'header.login': 'लॉग इन',
    'header.get_started': 'शुरू करें',
    'common.loading': 'लोड हो रहा है...',
    'common.save': 'सेव करें',
    'common.cancel': 'रद्द करें',
    'dashboard.overview': 'अवलोकन',
    'dashboard.properties': 'संपत्तियां',
    'dashboard.tenants': 'किरायेदार'
  },
  'th': {
    'app_name': 'HNV โซลูชันการจัดการอสังหาริมทรัพย์',
    'nav.home': 'หน้าแรก',
    'nav.about': 'เกี่ยวกับเรา',
    'nav.features': 'คุณสมบัติ',
    'nav.pricing': 'ราคา',
    'nav.contact': 'ติดต่อ',
    'nav.login': 'เข้าสู่ระบบ',
    'header.login': 'เข้าสู่ระบบ',
    'header.get_started': 'เริ่มต้น',
    'common.loading': 'กำลังโหลด...',
    'common.save': 'บันทึก',
    'common.cancel': 'ยกเลิก',
    'dashboard.overview': 'ภาพรวม',
    'dashboard.properties': 'อสังหาริมทรัพย์',
    'dashboard.tenants': 'ผู้เช่า'
  },
  'ar': {
    'app_name': 'حلول إدارة العقارات HNV',
    'nav.home': 'الرئيسية',
    'nav.about': 'حولنا',
    'nav.features': 'المميزات',
    'nav.pricing': 'الأسعار',
    'nav.contact': 'اتصل بنا',
    'nav.login': 'تسجيل الدخول',
    'header.login': 'تسجيل الدخول',
    'header.get_started': 'ابدأ الآن',
    'common.loading': 'جاري التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'dashboard.overview': 'نظرة عامة',
    'dashboard.properties': 'العقارات',
    'dashboard.tenants': 'المستأجرين'
  }
};

// Function to create nested object from dot notation
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
}

// Generate translation files
Object.keys(languageTranslations).forEach(langCode => {
  const translations = JSON.parse(JSON.stringify(baseTranslations)); // Deep copy
  const langTranslations = languageTranslations[langCode];
  
  // Apply specific translations
  Object.keys(langTranslations).forEach(key => {
    setNestedValue(translations, key, langTranslations[key]);
  });
  
  // Write to file
  const filePath = `/workspaces/HNV1/frontend/public/locales/${langCode}/translation.json`;
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
  console.log(`Generated ${langCode} translation file`);
});

console.log('All translation files generated successfully!');