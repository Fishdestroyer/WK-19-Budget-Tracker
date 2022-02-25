let db;

const request = indexedDB.open('WK-19-Budget-Tracker', 1);
request.onupgradeneeded = function (event) {

  const db = event.target.result;

  db.createObjectStore('new-transaction', { autoIncrement: true });
};

request.onsuccess = function (event) {

  db = event.target.result;

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

  transactionObjectStore.add(record);
}


function uploadTransaction() {
  const transaction = db.transaction(['new-transaction'], 'readwrite');

  const transactionObjectStore = transaction.objectStore('new-transaction');

  const getAll = transactionObjectStore.getAll();

  getAll.onsuccess = function () {
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

window.addEventListener('online', uploadTransaction);