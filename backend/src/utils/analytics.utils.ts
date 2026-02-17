import UAParser from 'ua-parser-js';
import geoip from 'geoip-lite';

export interface AnalyticsData {
  browser?: string;
  os?: string;
  deviceType?: string;
  countryCode?: string;
  city?: string;
}

export const parseUserAgent = (userAgent: string): Pick<AnalyticsData, 'browser' | 'os' | 'deviceType'> => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: result.browser.name || 'Unknown',
    os: result.os.name || 'Unknown',
    deviceType: result.device.type || 'desktop',
  };
};

export const getGeoLocation = (ip: string): Pick<AnalyticsData, 'countryCode' | 'city'> => {
  const geo = geoip.lookup(ip);

  if (!geo) {
    return {
      countryCode: undefined,
      city: undefined,
    };
  }

  return {
    countryCode: geo.country,
    city: geo.city,
  };
};

export const getClientIp = (req: any): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection.remoteAddress || '0.0.0.0';
};
