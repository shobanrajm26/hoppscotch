import { HoppCollection } from "@hoppscotch/data";
import { REST_COLLECTION_SCHEMA } from "../services/persistence/validation-schemas";

class IndexedDBStorage {
  private dbName = "HoppscotchDB"
  private dbVersion = 2
  private storeName = { restCollection : "restCollections",
    history : "history"}

  async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName.restCollection)) {
          db.createObjectStore(this.storeName.restCollection, { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains(this.storeName.history)) {
          db.createObjectStore(this.storeName.history, { keyPath: "id" })
        }
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async setDB(storeName: string, key: string, value: any): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);

      // Ensure the value is an object and has the provided key
      if (typeof value === 'string') {
        value = { id: key, data: value };
      } else {
        value.id = key;
      }

      const putRequest = store.put(value);

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    });
  }

  async getAllCollections(): Promise<HoppCollection[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName.restCollection, "readonly")
      const store = tx.objectStore(this.storeName.restCollection)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async saveCollection(collection: HoppCollection): Promise<void> {

    // Validate the collection against the schema
    const validationResult = REST_COLLECTION_SCHEMA.safeParse(collection);

    if (!validationResult.success) {
      // If validation fails, show an error and back up the invalid data
      window.localStorage.setItem(`restCollection-${collection.id}-backup`, JSON.stringify(collection));
      throw new Error(`Invalid data for collection: ${collection.id}`);
    }

    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName.restCollection, "readwrite")
      const store = tx.objectStore(this.storeName.restCollection)
      store.put(collection)

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async deleteCollection(id: string): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName.restCollection, "readwrite")
      const store = tx.objectStore(this.storeName.restCollection)
      store.delete(id)

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }
}

export const idbStorage = new IndexedDBStorage()
