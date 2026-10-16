import * as amplitude from '@amplitude/analytics-browser';
import {
  initBeacon,
  identifyBeacon,
  resetBeacon,
  trackBeacon,
} from './polarisBeacon';

const API_KEY = 'cff6990a540666def32202597cdf1984';

export const initAmplitude = () => {
  amplitude.init(API_KEY, {
    autocapture: false,
    defaultTracking: false,
  });
  initBeacon();
};

export const identifyUser = (userId) => {
  amplitude.setUserId(userId);
  identifyBeacon(userId);
};

export const resetUser = () => {
  amplitude.reset();
  resetBeacon();
};

export const track = (eventName, properties = {}) => {
  amplitude.track(eventName, properties);
  trackBeacon(eventName, properties);
};
