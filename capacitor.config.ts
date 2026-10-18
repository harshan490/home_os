import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.homebase.familyos',
  appName: 'HOMEBASE',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_homebase',
      iconColor: '#8B9CFF'
    }
  }
};

export default config;
