import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import App from './App.tsx'
import './index.css'

// ⚠️ 替换为你的 PayPal Client ID (Live模式)
const initialOptions = {
    "clientId": "AZ0hrt6qBz8NmTLtbKzQ6ODkXOzqHnhQ_6Kj74FzPWulQJxKwnTReSbxfgwsQ2oIRKZe0TFsSv61I33i",//"YOUR_PAYPAL_CLIENT_ID",
    currency: "USD"
    //intent: "capture", // 默认模式，组件内可覆盖
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PayPalScriptProvider options={initialOptions}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PayPalScriptProvider>
  </React.StrictMode>,
)
