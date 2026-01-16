import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'G-SORTER',
    description: 'Find new sellers on Facebook Marketplace. Created by https://t.me/bronchitis',
    permissions: ['tabs', 'activeTab', 'scripting'],
    host_permissions: ['*://*.facebook.com/*'],
    action: {
      default_title: 'G-SORTER',
    },
  },
});
