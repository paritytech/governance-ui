export async function open(
  name: string,
  storeName: string,
  version?: number
): Promise<IDBDatabase> {
  return new Promise(function (resolve, reject) {
    const request = indexedDB.open(name, version);
    request.onblocked = () => {
      // DB needs to be updated but is locked, eventually in another tab
      // TODO show error?
    };
    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName);
    };
    request.onerror = () => {
      reject(request.error);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}
