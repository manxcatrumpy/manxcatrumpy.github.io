'use strict';

self.importScripts('helpers.js');

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
  console.log('Received a push notification');

  var title = 'Yay a message.';
  var body;
  var data = {};
  if (event.data != undefined) {
    body = event.data.text();
    data.msg = body;
    console.log('with message: ' + event.data.text());
  } else {
    body = 'We have received a push notification.';
  }
  var icon = '/images/icon-192x192.png';
  var tag;
  if (showNotificationWithTag) {
    tag = 'simple-push-demo-notification-tag';
  }

  event.waitUntil(clients.matchAll({
    type: 'window'
  }).then(function(clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      client.postMessage('push event from SW');
    }
    let notificationOptions = {
      body: body,
      icon: icon,
      data: data,
      tag: tag
    };
    if (isInteractiveNotification) {
      notificationOptions.requireInteraction = true;
      notificationOptions.actions = [{action: 'answer', title: 'Answer'},
                                     {action: 'decline', title: 'Decline'}];
    }
    self.registration.showNotification(title, notificationOptions);
  }));
});

self.addEventListener('pushsubscriptionchange', e => {
  console.log('Subscription expired');
  e.waitUntil(registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationKeys.publicKey,
    })
    .then(subscription => {
      // TODO: Send new subscription to application server
      console.log("subscription: " + JSON.stringify(subscription.toJSON()));
    }));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  console.log("Notification Click, action: " + event.action);
  if ('openApp' in clients ) {
    if (event.notification.data.msg != undefined) {
      var openAppEvent = {
        msg: event.notification.data.msg
      }
      clients.openApp(openAppEvent);
    } else {
      clients.openApp();
    }
  } else {
    clients.openWindow('/index.html');
  }
});