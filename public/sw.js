self.addEventListener("push", (event) => {
  if (!event.data) return;

  const payload = event.data.json();
  const notifType = payload.data?.type;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const focused = clients.some((c) => c.visibilityState === "visible");

        if (focused) return;

        if (clients.length > 0) {
          clients.forEach((c) =>
            c.postMessage({
              type: "play-notification-sound",
              notificationType: notifType,
            })
          );
        }

        return self.registration.showNotification(payload.title, {
          body: payload.body,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          data: payload.data || { url: "/notifications" },
          tag: payload.tag || undefined,
          renotify: !!payload.tag,
          silent: clients.length > 0,
        });
      })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/notifications";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find(
          (c) => c.url.includes(self.location.origin) && "focus" in c
        );
        if (existing) {
          existing.focus();
          existing.navigate(url);
          return;
        }
        return self.clients.openWindow(url);
      })
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription.options)
      .then((subscription) => {
        return fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            p256dh: btoa(
              String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")))
            ),
            auth: btoa(
              String.fromCharCode(...new Uint8Array(subscription.getKey("auth")))
            ),
          }),
        });
      })
  );
});
