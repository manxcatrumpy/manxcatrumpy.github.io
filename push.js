var versionText = document.getElementById('version');
var registerBtn = document.querySelector('#register button');

if ('mozSetMessageHandler' in navigator) {
  navigator.mozSetMessageHandler('serviceworker-notification', function(m) {
    console.log('Push notification = ' + m.msg);
  });
}

window.addEventListener('load', function() {
  versionText.textContent = version;
  console.log('W3C Push Demo App version ' + version);
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

function register() {
  navigator.serviceWorker.ready
    .then((serviceWorkerRegistration) => {
      return serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationKeys.publicKey,
      });
    })
    .then((subscription) => {
      if (subscription.options.applicationServerKey) {
        var keyArray = new Uint8Array(subscription.options.applicationServerKey);
        console.debug("subscribe with key: " + uint8ArrayToBase64Url(keyArray));
      }
      console.debug("Push subscription: " + JSON.stringify(subscription));
    })
    .catch((subscriptionErr) => {
      console.debug("subscriptionErr: " + subscriptionErr);
    });
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
        console.log("subscription: " + JSON.stringify(subscription.toJSON()));
        if (subscription.options.applicationServerKey) {
          console.log("It is a VAPID subscription");
        } else {
          console.log("It is a non-VAPID subscription");
        }
      })  
      .catch(function(err) {  
        console.log('Error during getSubscription()', err);  
      }); 

  });  
}

window.addEventListener('keydown', function(event) {
  switch (event.key) {
    case 'SoftRight':
      register();
      break;
  }
});
