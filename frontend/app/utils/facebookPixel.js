let pixelInitialized = false;
let currentPixelId = null;

export const initFacebookPixel = (pixelId) => {
  if (pixelInitialized && currentPixelId === pixelId) return;
  if (!pixelId || typeof window === 'undefined') return;

  try {
    if (!window.fbq) {
      (function(f,b,e,v,n,t,s) {
        if(f.fbq) return;
        n=f.fbq=function(){n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)};
        if(!f._fbq) f._fbq=n;
        n.push=n;
        n.loaded=!0;
        n.version='2.0';
        n.queue=[];
        t=b.createElement(e);
        t.async=!0;
        t.src=v;
        s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s);
      })(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    }

    window.fbq('init', pixelId);
    pixelInitialized = true;
    currentPixelId = pixelId;
  } catch (error) {
    console.error('Facebook Pixel initialization error:', error);
  }
};

export const trackPixelEvent = (eventName, eventData = {}) => {
  if (typeof window !== 'undefined' && window.fbq && pixelInitialized) {
    try {
      window.fbq('track', eventName, eventData);
    } catch (error) {
      console.error('Facebook Pixel tracking error:', error);
    }
  }
};

export const resetPixel = () => {
  pixelInitialized = false;
  currentPixelId = null;
};
