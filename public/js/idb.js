let db;

const request = indexedDB.open('WK-19-Budget-Tracker', 1);
request.onupgradeneeded = function (event) {

  // when db is successfully created with its object store (from onupgradedneeded event above), save reference to db in global variable
  const db = event.target.result;

  db.createObjectStore('new-transaction', { autoIncrement: true });
};

request.onsuccess = function (event) {

  db = event.target.result;
//Verify the app is online
  if (navigator.onLine) {

    uploadTransaction();
  }
};

request.onerror = function (event) {

  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(['new-transaction'], 'readwrite');

  const transactionObjectStore = transaction.objectStore('new-transaction');
 // add record to your store with add method.
  transactionObjectStore.add(record);
}


function uploadTransaction() {
  // open a transaction on your pending db
  const transaction = db.transaction(['new-transaction'], 'readwrite');
// access your pending object store
  const transactionObjectStore = transaction.objectStore('new-transaction');

  const getAll = transactionObjectStore.getAll();

  // get all records from store and set to a variable
  getAll.onsuccess = function () {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          accept: 'application/json, text/plain, */*',
          'content-type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(['new-transaction'], 'readwrite');
          const transactionObjectStore = transaction.objectStore('new-transaction');

          transactionObjectStore.clear();
        })
        .catch(err => {

          console.log(err);
        });

    }
  };
}
//Upload transaction when connection is established
window.addEventListener('online', uploadTransaction);