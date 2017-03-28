'use strict';

var port;

self.addEventListener('activate', function(event) {

  event.waitUntil(
    clients.claim().then(function() {
      // After the activation and claiming is complete, send a message to each of the controlled
      // pages letting it know that it's active.
      // This will trigger navigator.serviceWorker.onmessage in each client.
      return self.clients.matchAll().then(function(clients) {
        return Promise.all(clients.map(function(client) {
          return client.postMessage('The service worker has activated and ' +
            'taken control.');
        }));
      });
    })
  );
});

self.addEventListener('push', function(event) {
  console.log('Received a push message', event);

  var title = 'Yay a message.';
  var body;
  var data = {};
  if (event.data != undefined) {
    body = event.data.text();
    data.msg = body;
  } else {
    body = 'We have received a push notification.';
  }
  var icon = '/images/icon-192x192.png';
  var tag = 'simple-push-demo-notification-tag';

  event.waitUntil(clients.matchAll({
    type: 'window'
  }).then(function(clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      return client.postMessage('push event from SW');
    }
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
      data: data,
      tag: tag
    })
  }));
});

self.addEventListener('pushsubscriptionchange', e => {
  console.log('Subscription expired');
  var _applicationKeys = {
    publicKey: base64UrlToUint8Array(
      'BIuoU7oJ1yjSv9081Kw2tpN10y6Zi3U7OQnHrbssrkVP8z1igHjKFfwQFNl1MnLBXvwyNMNulq-_nBdXzujrxUc'),
  };
  e.waitUntil(registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: _applicationKeys.publicKey,
    })
    .then(subscription => {
      // TODO: Send new subscription to application server
      console.log("subscription: " + JSON.stringify(subscription.toJSON()));
    }));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  console.log("Notification Click");
  if (event.notification.data.msg != undefined) {
    var openAppEvent = {
      msg: event.notification.data.msg
    }
    clients.openApp(openAppEvent);
  } else {
    clients.openApp();
  }
});

// Converts the URL-safe base64 encoded |base64UrlData| to an Uint8Array buffer.
function base64UrlToUint8Array(base64UrlData) {
  const padding = '='.repeat((4 - base64UrlData.length % 4) % 4);
  const base64 = (base64UrlData + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = self.atob(base64);
  const buffer = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    buffer[i] = rawData.charCodeAt(i);
  }
  return buffer;
}