import type { RFP, MasterData, DataMappingRule } from '../types/rfp';

// IndexedDB 스키마 정의
const DB_NAME = 'VCRFP_DB';
const DB_VERSION = 1;


export class StorageService {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('IndexedDB 초기화 실패'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // RFPs 저장소
        if (!db.objectStoreNames.contains('rfps')) {
          const rfpStore = db.createObjectStore('rfps', { keyPath: 'id' });
          rfpStore.createIndex('createdAt', 'createdAt', { unique: false });
          rfpStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // 마스터 데이터 저장소
        if (!db.objectStoreNames.contains('masterData')) {
          const masterDataStore = db.createObjectStore('masterData', { keyPath: 'id' });
          masterDataStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        // 매핑 규칙 저장소
        if (!db.objectStoreNames.contains('mappings')) {
          db.createObjectStore('mappings', { keyPath: 'rfpId' });
        }

        // 파일 저장소 (대용량 파일용)
        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'id' });
          fileStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
          fileStore.createIndex('type', 'type', { unique: false });
        }

        // 설정 저장소
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  // RFP 관련 메서드
  async saveRFP(rfp: RFP): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rfps'], 'readwrite');
      const store = transaction.objectStore('rfps');
      const request = store.put(rfp);

      request.onsuccess = () => {
        // LocalStorage에도 백업 저장
        this.saveToLocalStorage('rfps', rfp.id, rfp);
        resolve();
      };

      request.onerror = () => {
        reject(new Error('RFP 저장 실패'));
      };
    });
  }

  async getRFP(id: string): Promise<RFP | null> {
    if (!this.db) {
      // IndexedDB가 초기화되지 않은 경우 LocalStorage에서 조회
      return this.getFromLocalStorage('rfps', id);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rfps'], 'readonly');
      const store = transaction.objectStore('rfps');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error('RFP 조회 실패'));
      };
    });
  }

  async getAllRFPs(): Promise<RFP[]> {
    if (!this.db) {
      // IndexedDB가 초기화되지 않은 경우 LocalStorage에서 조회
      return this.getAllFromLocalStorage('rfps');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rfps'], 'readonly');
      const store = transaction.objectStore('rfps');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('RFP 목록 조회 실패'));
      };
    });
  }

  async deleteRFP(id: string): Promise<void> {
    if (!this.db) {
      this.removeFromLocalStorage('rfps', id);
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rfps'], 'readwrite');
      const store = transaction.objectStore('rfps');
      const request = store.delete(id);

      request.onsuccess = () => {
        this.removeFromLocalStorage('rfps', id);
        resolve();
      };

      request.onerror = () => {
        reject(new Error('RFP 삭제 실패'));
      };
    });
  }

  // 마스터 데이터 관련 메서드
  async saveMasterData(data: MasterData & { id: string; lastModified: Date }): Promise<void> {
    if (!this.db) {
      this.saveToLocalStorage('masterData', data.id, data);
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['masterData'], 'readwrite');
      const store = transaction.objectStore('masterData');
      const request = store.put(data);

      request.onsuccess = () => {
        this.saveToLocalStorage('masterData', data.id, data);
        resolve();
      };

      request.onerror = () => {
        reject(new Error('마스터 데이터 저장 실패'));
      };
    });
  }

  async getMasterData(id: string): Promise<(MasterData & { id: string; lastModified: Date }) | null> {
    if (!this.db) {
      return this.getFromLocalStorage('masterData', id);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['masterData'], 'readonly');
      const store = transaction.objectStore('masterData');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error('마스터 데이터 조회 실패'));
      };
    });
  }

  // 매핑 규칙 관련 메서드
  async saveMappingRule(rule: DataMappingRule): Promise<void> {
    if (!this.db) {
      this.saveToLocalStorage('mappings', rule.rfpId, rule);
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mappings'], 'readwrite');
      const store = transaction.objectStore('mappings');
      const request = store.put(rule);

      request.onsuccess = () => {
        this.saveToLocalStorage('mappings', rule.rfpId, rule);
        resolve();
      };

      request.onerror = () => {
        reject(new Error('매핑 규칙 저장 실패'));
      };
    });
  }

  async getMappingRule(rfpId: string): Promise<DataMappingRule | null> {
    if (!this.db) {
      return this.getFromLocalStorage('mappings', rfpId);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mappings'], 'readonly');
      const store = transaction.objectStore('mappings');
      const request = store.get(rfpId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error('매핑 규칙 조회 실패'));
      };
    });
  }

  // 파일 저장 관련 메서드 (대용량 파일용)
  async saveFile(file: File): Promise<string> {
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const arrayBuffer = await file.arrayBuffer();

    const fileData = {
      id: fileId,
      name: file.name,
      type: file.type,
      data: arrayBuffer,
      uploadedAt: new Date()
    };

    if (!this.db) {
      // IndexedDB가 없으면 작은 파일만 LocalStorage에 저장 (base64)
      if (file.size > 5 * 1024 * 1024) { // 5MB 제한
        throw new Error('파일이 너무 큽니다. IndexedDB를 사용하세요.');
      }
      
      const base64 = await this.arrayBufferToBase64(arrayBuffer);
      this.saveToLocalStorage('files', fileId, { ...fileData, data: base64 });
      return fileId;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.put(fileData);

      request.onsuccess = () => {
        resolve(fileId);
      };

      request.onerror = () => {
        reject(new Error('파일 저장 실패'));
      };
    });
  }

  async getFile(fileId: string): Promise<{ name: string; type: string; data: ArrayBuffer } | null> {
    if (!this.db) {
      const fileData = this.getFromLocalStorage('files', fileId);
      if (fileData && typeof fileData.data === 'string') {
        // base64를 ArrayBuffer로 변환
        const arrayBuffer = await this.base64ToArrayBuffer(fileData.data);
        return { ...fileData, data: arrayBuffer };
      }
      return fileData;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.get(fileId);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve({
            name: result.name,
            type: result.type,
            data: result.data
          });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(new Error('파일 조회 실패'));
      };
    });
  }

  // 설정 관련 메서드
  async saveSetting(key: string, value: any): Promise<void> {
    const setting = { key, value, updatedAt: new Date() };

    if (!this.db) {
      this.saveToLocalStorage('settings', key, setting);
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put(setting);

      request.onsuccess = () => {
        this.saveToLocalStorage('settings', key, setting);
        resolve();
      };

      request.onerror = () => {
        reject(new Error('설정 저장 실패'));
      };
    });
  }

  async getSetting(key: string): Promise<any> {
    if (!this.db) {
      const setting = this.getFromLocalStorage('settings', key);
      return setting?.value;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.value);
      };

      request.onerror = () => {
        reject(new Error('설정 조회 실패'));
      };
    });
  }

  // 데이터 백업 및 복원
  async exportData(): Promise<string> {
    const exportData = {
      rfps: await this.getAllRFPs(),
      mappings: await this.getAllMappings(),
      settings: await this.getAllSettings(),
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);
      
      // RFPs 가져오기
      if (importData.rfps) {
        for (const rfp of importData.rfps) {
          await this.saveRFP(rfp);
        }
      }

      // 매핑 규칙 가져오기
      if (importData.mappings) {
        for (const mapping of importData.mappings) {
          await this.saveMappingRule(mapping);
        }
      }

      // 설정 가져오기
      if (importData.settings) {
        for (const [key, value] of Object.entries(importData.settings)) {
          await this.saveSetting(key, value);
        }
      }
    } catch (error) {
      throw new Error('데이터 가져오기 실패: ' + (error as Error).message);
    }
  }

  // LocalStorage 백업 메서드들
  private saveToLocalStorage(store: string, key: string, data: any): void {
    try {
      const storeKey = `${DB_NAME}_${store}`;
      let storeData = JSON.parse(localStorage.getItem(storeKey) || '{}');
      storeData[key] = data;
      localStorage.setItem(storeKey, JSON.stringify(storeData));
    } catch (error) {
      console.warn('LocalStorage 저장 실패:', error);
    }
  }

  private getFromLocalStorage(store: string, key: string): any {
    try {
      const storeKey = `${DB_NAME}_${store}`;
      const storeData = JSON.parse(localStorage.getItem(storeKey) || '{}');
      return storeData[key] || null;
    } catch (error) {
      console.warn('LocalStorage 조회 실패:', error);
      return null;
    }
  }

  private getAllFromLocalStorage(store: string): any[] {
    try {
      const storeKey = `${DB_NAME}_${store}`;
      const storeData = JSON.parse(localStorage.getItem(storeKey) || '{}');
      return Object.values(storeData);
    } catch (error) {
      console.warn('LocalStorage 전체 조회 실패:', error);
      return [];
    }
  }

  private removeFromLocalStorage(store: string, key: string): void {
    try {
      const storeKey = `${DB_NAME}_${store}`;
      let storeData = JSON.parse(localStorage.getItem(storeKey) || '{}');
      delete storeData[key];
      localStorage.setItem(storeKey, JSON.stringify(storeData));
    } catch (error) {
      console.warn('LocalStorage 삭제 실패:', error);
    }
  }

  // 유틸리티 메서드들
  private async getAllMappings(): Promise<DataMappingRule[]> {
    if (!this.db) {
      return this.getAllFromLocalStorage('mappings');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mappings'], 'readonly');
      const store = transaction.objectStore('mappings');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('매핑 규칙 전체 조회 실패'));
      };
    });
  }

  private async getAllSettings(): Promise<{ [key: string]: any }> {
    if (!this.db) {
      return this.getAllFromLocalStorage('settings').reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.getAll();

      request.onsuccess = () => {
        const settings = request.result || [];
        const settingsMap = settings.reduce((acc: any, setting: any) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
        resolve(settingsMap);
      };

      request.onerror = () => {
        reject(new Error('설정 전체 조회 실패'));
      };
    });
  }

  private async arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private async base64ToArrayBuffer(base64: string): Promise<ArrayBuffer> {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // 스토리지 정리
  async clearAllData(): Promise<void> {
    // IndexedDB 정리
    if (this.db) {
      const stores = ['rfps', 'masterData', 'mappings', 'files', 'settings'];
      for (const storeName of stores) {
        await new Promise<void>((resolve, reject) => {
          const transaction = this.db!.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.clear();

          request.onsuccess = () => resolve();
          request.onerror = () => reject(new Error(`${storeName} 정리 실패`));
        });
      }
    }

    // LocalStorage 정리
    const keys = Object.keys(localStorage).filter(key => key.startsWith(DB_NAME));
    keys.forEach(key => localStorage.removeItem(key));
  }

  // 스토리지 상태 확인
  async getStorageInfo(): Promise<{
    indexedDBAvailable: boolean;
    localStorageUsed: number;
    indexedDBUsed?: number;
  }> {
    const info = {
      indexedDBAvailable: !!this.db,
      localStorageUsed: 0,
      indexedDBUsed: 0
    };

    // LocalStorage 사용량 계산
    let localStorageSize = 0;
    for (const key in localStorage) {
      if (key.startsWith(DB_NAME)) {
        localStorageSize += localStorage[key].length;
      }
    }
    info.localStorageUsed = localStorageSize;

    // IndexedDB 사용량은 정확한 계산이 복잡하므로 추정값 제공
    if (this.db) {
      const rfpCount = (await this.getAllRFPs()).length;
      info.indexedDBUsed = rfpCount * 10000; // 추정값
    }

    return info;
  }
}