import * as Sentry from '@sentry/react-native';

// import { Platform } from 'react-native';

const reportSentry = (error: any) => {
  if (!__DEV__) {
    Sentry.captureException(error);
  } else {
    console.log('sentry error', error);
  }
};

export default reportSentry;
