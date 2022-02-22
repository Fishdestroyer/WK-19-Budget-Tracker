let db;

const request = indexedDB.open('WK-19-Budget-Tracker', 1);
request.onupgradeneeded = function (event) {

  const db = event.target.result;

  db.createObjectStore('new-transaction', { autoIncrement: true });
};

request.onsuccess = function (event) {

  db = event.target.result;

  if (navigator.onLine) {

    uploadNewTransaction();
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
