const isBrowserNotificationAvailable = () =>
  typeof window !== "undefined" && "Notification" in window;

export const requestBrowserNotificationPermission = async () => {
  if (!isBrowserNotificationAvailable()) {
    return "unsupported";
  }

  if (window.Notification.permission === "granted") {
    return "granted";
  }

  if (window.Notification.permission === "denied") {
    return "denied";
  }

  return window.Notification.requestPermission();
};

export const sendBrowserNotification = async ({ title, body }) => {
  const permission = await requestBrowserNotificationPermission();

  if (permission !== "granted") {
    return false;
  }

  new window.Notification(title, {
    body,
  });

  return true;
};
