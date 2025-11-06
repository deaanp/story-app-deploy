const VAPID_PUBLIC_KEY =
  'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
const BASE_URL = 'https://story-api.dicoding.dev/v1';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }
  return permission;
}

export async function subscribePush(token) {
  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();

  if (existing) {
    console.log('Already subscribed');
    return true;
  }

  const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
  const newSub = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  await fetch(`${BASE_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      endpoint: newSub.endpoint,
      keys: {
        p256dh: newSub.toJSON().keys.p256dh,
        auth: newSub.toJSON().keys.auth,
      },
    }),
  });
  console.log('Subscribed successfully');
  return true;
}

export async function unsubscribePush(token) {
  const registration = await navigator.serviceWorker.ready;
  const sub = await registration.pushManager.getSubscription();

  if (!sub) {
    console.log('No active subscription');
    return;
  }

  console.log('Before unsubscribed, sub =', sub);

  await fetch(`${BASE_URL}/notifications/subscribe`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  });
  await sub.unsubscribe();

  const check = await registration.pushManager.getSubscription();
  console.log('After unsubscribe, sub =', check);
  
  console.log('Unsubscribed successfully');
  return true;
}
