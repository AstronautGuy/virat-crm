import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  "appId": "com.devfinity.viratcrm",
  "appName": "Virat CRM",
  "webDir": "out",
  "server": {
    "url": "https://virat-crm.vercel.app",
    "cleartext": true
  }
}

export default config;
