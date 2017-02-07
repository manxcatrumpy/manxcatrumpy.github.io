var registerBtn = document.querySelector('#register button');

var _applicationKeys = {
      publicKey: window.base64UrlToUint8Array(
        'BIuoU7oJ1yjSv9081Kw2tpN10y6Zi3U7OQnHrbssrkVP8z1igHjKFfwQFNl1MnLBXvwyNMNulq-_nBdXzujrxUc'),
      privateKey: window.base64UrlToUint8Array(
        'iZoUhDqh5xHLHlO5zTWUOk64UMHFUmLrFQxiTNNNqRo'),
};

navigator.mozSetMessageHandler('push', function(message) {
	var notification = new Notification(
		'Got a notification from the server!', { body: message.version });
	
	notification.addEventListener('click', function() {
    launchSelf();
	});
});

navigator.mozSetMessageHandler('push-register', function(e) {
  register();
});

navigator.mozSetMessageHandler('notification', function(m) {
      //data = m;
      //var p = document.createElement('p');
      //p.textContent = 'Message ' + (index++) + ': ' + JSON.stringify(m);
      //document.body.appendChild(p);
      console.log('Push notification');
      launchSelf();
});


window.addEventListener('load', function() {
  
  registerBtn.addEventListener('click', function() {
    register();
  });

   // Check that service workers are supported, if so, progressively  
  // enhance and add push messaging support, otherwise continue without it.  
  if ('serviceWorker' in navigator) {  
    navigator.serviceWorker.register('./service-worker.js').then(function(reg) {
      if(reg.installing) {
        console.log('Service worker installing');
      } else if(reg.waiting) {
        console.log('Service worker installed');
      } else if(reg.active) {
        console.log('Service worker active');
      }

      navigator.serviceWorker.addEventListener('message', function(event) {
       console.log(event.data);
      });

      initialiseState(reg);

    });  
  } else {  
    console.log('Service workers aren\'t supported in this browser.');
  }  

});

function registerServiceWorker() {
   // Check that service workers are supported
  if ('serviceWorker' in navigator) {

    navigator.serviceWorker.register('./service-worker.js')
    .catch((err) => {
      this.showErrorMessage(
        'Unable to Register SW',
        'Sorry this demo requires a service worker to work and it ' +
        'failed to install - sorry :('
      );
      console.error(err);
    });
  } else {
    this.showErrorMessage(
      'Service Worker Not Supported',
      'Sorry this demo requires service worker support in your browser. ' +
      'Please try this demo in Chrome or Firefox Nightly.'
    );
  }
}

function register() {
  //registerServiceWorker();

  navigator.serviceWorker.ready
    .then((serviceWorkerRegistration) => {
        return serviceWorkerRegistration.pushManager.subscribe(
          {
            userVisibleOnly: true,
            applicationServerKey: _applicationKeys.publicKey,
          }
        );
      })
      .then((subscription) => {
        console.debug("subscription: "  + JSON.stringify(subscription));
        //this._stateChangeCb(this._state.SUBSCRIBED);
        //this._subscriptionUpdate(subscription);
      })
      .catch((subscriptionErr) => {
         console.debug("subscriptionErr: "  + subscriptionErr);
        //this._stateChangeCb(this._state.ERROR, subscriptionErr);
      });

}

function launchSelf() {
  var request = window.navigator.mozApps.getSelf();
  request.onsuccess = function() {
    if (request.result) {
      request.result.launch();
    }
  };
}

function initialiseState(reg) {
// We need the service worker registration to check for a subscription  
  navigator.serviceWorker.ready.then(function(reg) {  
    // Do we already have a push message subscription?  
    reg.pushManager.getSubscription()  
      .then(function(subscription) {  

        if (!subscription) {  
          console.log('Not yet subscribed to Push')
          // We aren't subscribed to push, so set UI  
          // to allow the user to enable push  
          return;  
        }
        
        // initialize status, which includes setting UI elements for subscribed status
        // and updating Subscribers list via push
        console.log(subscription.toJSON());
        var endpoint = subscription.endpoint;
        var key = subscription.getKey('p256dh');
        console.log(key);
      })  
      .catch(function(err) {  
        console.log('Error during getSubscription()', err);  
      }); 

      // set up a message channel to communicate with the SW
      var channel = new MessageChannel();
      channel.port1.onmessage = function(e) {
        console.log(e);
        //handleChannelMessage(e.data);
      }
      
      mySW = reg.active;
      mySW.postMessage('hello', [channel.port2]);
  });  
}