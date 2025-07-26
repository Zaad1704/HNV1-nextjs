import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    resources: {
      en: {
        translation: {
          auth: {
            welcome_back: 'Welcome Back',
            sign_in_subtitle: 'Sign in to your account',
            email_address: 'Email Address',
            enter_email: 'Enter your email',
            password: 'Password',
            enter_password: 'Enter your password',
            forgot_password: 'Forgot Password?',
            sign_in: 'Sign In',
            or: 'or',
            continue_google: 'Continue with Google',
            no_account: "Don't have an account?",
            sign_up: 'Sign Up'
          },
          header: {
            login: 'Login',
            get_started: 'Get Started'
          },
          common: {
            property_management: 'Property Management',
            about: 'About',
            learn_more: 'Learn more',
            theme: 'Theme'
          },
          nav: {
            contact: 'Contact'
          }
        }
      }
    }
  });

export default i18n;