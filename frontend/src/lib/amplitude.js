import * as amplitude from '@amplitude/analytics-browser';

const API_KEY = 'cff6990a540666def32202597cdf1984';

export const initAmplitude = () => {
  amplitude.init(API_KEY, {
    autocapture: false,
    defaultTracking: false,
  });
};

export const identifyUser = (userId) => {
  amplitude.setUserId(userId);
};

export const resetUser = () => {
  amplitude.reset();
};

export const track = (eventName, properties = {}) => {
  amplitude.track(eventName, properties);
};
