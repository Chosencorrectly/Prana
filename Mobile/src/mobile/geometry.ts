export type MobileDeviceGeometry = {
  device: {
    width: number;
    height: number;
  };
  screen: {
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
  };
  safeArea: {
    top: number;
    bottom: number;
  };
  keyboard: {
    height: number;
  };
};

export const iphoneGeometry = {
  // User-requested 430 × 932 canvas. Preserve the original bezel opening
  // by scaling its calibrated 393 × 852 screen coordinates on each axis.
  device: {
    width: 511 * 430 / 393,
    height: 968 * 932 / 852,
  },
  screen: {
    x: 59 * 430 / 393,
    y: 58 * 932 / 852,
    width: 430,
    height: 932,
    radius: 42 * 430 / 393,
  },
  safeArea: {
    top: 62,
    bottom: 34,
  },
  keyboard: {
    height: 301,
  },
} as const satisfies MobileDeviceGeometry;

export const pixelGeometry = {
  // Pixel10.png is a 2x asset. Its 854 x 1904 screen opening renders at
  // exactly 427 x 952 CSS pixels inside the 566 x 1022 asset canvas.
  device: {
    width: 566,
    height: 1022,
  },
  screen: {
    x: 70,
    y: 35,
    width: 427,
    height: 952,
    radius: 58,
  },
  safeArea: {
    top: 64,
    bottom: 48,
  },
  keyboard: {
    height: 316,
  },
} as const satisfies MobileDeviceGeometry;

export type IPhoneGeometry = typeof iphoneGeometry;
