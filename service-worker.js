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
  var body = event.data.text();//'We have received a push message.';
  var icon = '/images/icon-192x192.png';
  //var tag = 'simple-push-demo-notification-tag';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon
      //tag: tag
    }).then( function() {
      return fetch('http://172.20.249.97:3000/register', {
        method: 'post',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          url: 'Andy'
        })
      });
    })
  );
});

self.onmessage = function(e) {
  console.log(e);
  port = e.ports[0];
}

/*
self.addEventListener('push', function(event) {
  console.log('Received a push message', event);


  event.waitUntil(
    clients.claim().then(function() {
      console.log("clients.claim from get push message");
      // After the activation and claiming is complete, send a message to each of the controlled
      // pages letting it know that it's active.
      // This will trigger navigator.serviceWorker.onmessage in each client.
      return self.clients.matchAll().then(function(clients) {
        return Promise.all(clients.map(function(client) {
          return client.postMessage('Push message got.');
        }));
      });
    })
  );
});
*/

self.addEventListener('notificationclick', function(event) {
  console.log('On notification click: ', event.notification.tag);
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is

  event.waitUntil(clients.matchAll({
    type: 'window'
  }).then(function(clientList) {
    //port.postMessage("notificationclick");
    console.log("clientList.length=" + clientList.length);
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      //if (client.url === '/' && 'focus' in client) {
      //  return client.focus();
      //}
      return client.postMessage('click event from SW');
    }
    if (clients.openWindow) {
      return clients.openWindow('/');
    }
  },
  function(error){
    console.log("get client error= " + JSON.stringify(error));
  }));

/*
  event.waitUntil(
    clients.claim().then(function() {
      console.log("clients.claim");
      // After the activation and claiming is complete, send a message to each of the controlled
      // pages letting it know that it's active.
      // This will trigger navigator.serviceWorker.onmessage in each client.
      return self.clients.matchAll().then(function(clients) {
        return Promise.all(clients.map(function(client) {
          return client.postMessage('The notification has clicked.');
        }));
      });
    })
  );
*/
  //new WindowClient('/');
});
