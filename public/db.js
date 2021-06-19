const { json, response } = require("express");

const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;
let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function ({ target }) {
  let db = target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function ({ target }) {
  db = target.result;
  if (navigator.onLine) {
    checkDataBase();
  }
};

request.onerror = function (e) {
  console.log("There was an error" + e.target.errorCode);
  console.log(e);
};

function checkDataBase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      })
        .then((response) => {
          return response.JSON;
        })
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}

function saveRecord(data) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(data);
}

window.addEventListener("online", checkDataBase());
