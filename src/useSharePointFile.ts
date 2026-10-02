import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { graphFilesRequest, graphConfig } from './components/Auth';
const RESOLVED_IDS_KEY = 'sp_resolved_ids_v1';
const FILE_CACHE_META_KEY = 'sp_file_cache_meta_v1';
const FILE_CACHE_BUFFER_KEY = 'sp_file_cache_buffer_v1';
interface ResolvedIds {
  siteId: string;
  driveId: string;
  itemId: string;
  resolvedAt: number;
}
interface CacheMeta {
  etag: string;
  lastModifiedDateTime: string;
  cachedAt: number;
}
const RESOLVED_IDS_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const CONTENT_CHECK_TTL_MS = 1000 * 60 * 5;
const getResolvedIdsFromStorage = (): ResolvedIds | null => {
  try {
    const raw = localStorage.getItem(RESOLVED_IDS_KEY);
    if (!raw) return null;
    const parsed: ResolvedIds = JSON.parse(raw);
    if (Date.now() - parsed.resolvedAt > RESOLVED_IDS_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
};
const saveResolvedIdsToStorage = (ids: Omit<ResolvedIds, 'resolvedAt'>) => {
  try {
    localStorage.setItem(RESOLVED_IDS_KEY, JSON.stringify({ ...ids, resolvedAt: Date.now() }));
  } catch {}
};
const getCacheMeta = (): CacheMeta | null => {
  try {
    const raw = sessionStorage.getItem(FILE_CACHE_META_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
const saveCacheMeta = (meta: Omit<CacheMeta, 'cachedAt'>) => {
  try {
    sessionStorage.setItem(FILE_CACHE_META_KEY, JSON.stringify({ ...meta, cachedAt: Date.now() }));
  } catch {}
};
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};
const getCachedBuffer = (): ArrayBuffer | null => {
  try {
    const raw = sessionStorage.getItem(FILE_CACHE_BUFFER_KEY);
    if (!raw) return null;
    return base64ToArrayBuffer(raw);
  } catch {
    return null;
  }
};
const saveCachedBuffer = (buffer: ArrayBuffer) => {
  try {
    sessionStorage.setItem(FILE_CACHE_BUFFER_KEY, arrayBufferToBase64(buffer));
  } catch {}
};
interface SharePointFileResult {
  buffer: ArrayBuffer;
  fromCache: boolean;
  lastModifiedDateTime: string;
}
export const useSharePointFile = () => {
  const { instance, accounts } = useMsal();
  const acquireGraphToken = async (): Promise<string> => {
    const account = accounts[0];
    if (!account) throw new Error('Tidak ada akun yang login. Silakan login terlebih dahulu.');
    try {
      const result = await instance.acquireTokenSilent({
        ...graphFilesRequest,
        account,
      });
      return result.accessToken;
    } catch (err) {
      if (err instanceof InteractionRequiredAuthError) {
        const result = await instance.acquireTokenPopup(graphFilesRequest);
        return result.accessToken;
      }
      throw err;
    }
  };
  const graphFetch = async (url: string, token: string, init?: RequestInit): Promise<Response> => {
    const res = await fetch(url, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Graph API error ${res.status}: ${text || res.statusText}`);
    }
    return res;
  };
  const resolveIds = async (token: string): Promise<ResolvedIds> => {
    const cached = getResolvedIdsFromStorage();
    if (cached) return cached;
    const siteRes = await graphFetch(
      `${graphConfig.graphEndpoint}/sites/${graphConfig.sharePointHost}:${graphConfig.sharePointSitePath}`,
      token,
    );
    const siteJson = await siteRes.json();
    const siteId: string = siteJson.id;
    const driveRes = await graphFetch(`${graphConfig.graphEndpoint}/sites/${siteId}/drive`, token);
    const driveJson = await driveRes.json();
    const driveId: string = driveJson.id;
    const searchRes = await graphFetch(
      `${graphConfig.graphEndpoint}/drives/${driveId}/root/search(q='${encodeURIComponent(graphConfig.targetFileName)}')`,
      token,
    );
    const searchJson = await searchRes.json();
    const match = (searchJson.value || []).find(
      (item: any) => item.name === graphConfig.targetFileName,
    );
    if (!match) {
      throw new Error(`File "${graphConfig.targetFileName}" tidak ditemukan di SharePoint.`);
    }
    const itemId: string = match.id;
    const resolved: ResolvedIds = { siteId, driveId, itemId, resolvedAt: Date.now() };
    saveResolvedIdsToStorage(resolved);
    return resolved;
  };
  const fetchFile = async (forceRefresh = false): Promise<SharePointFileResult> => {
    // Browser tahu sedang offline: jangan buang-buang request yang pasti gagal —
    // langsung sajikan cache bila ada (percobaan berikutnya otomatis online lagi)
    if (!navigator.onLine) {
      const offlineBuffer = getCachedBuffer();
      const offlineMeta = getCacheMeta();
      if (offlineBuffer && offlineMeta) {
        return { buffer: offlineBuffer, fromCache: true, lastModifiedDateTime: offlineMeta.lastModifiedDateTime };
      }
    }
    const token = await acquireGraphToken();
    const ids = await resolveIds(token);
    const cacheMeta = getCacheMeta();
    const cacheStillFresh =
      !forceRefresh && cacheMeta && Date.now() - cacheMeta.cachedAt < CONTENT_CHECK_TTL_MS;
    if (cacheStillFresh) {
      const buffer = getCachedBuffer();
      if (buffer) {
        return { buffer, fromCache: true, lastModifiedDateTime: cacheMeta!.lastModifiedDateTime };
      }
    }
    let metaJson: any;
    try {
      const metaRes = await graphFetch(
        `${graphConfig.graphEndpoint}/drives/${ids.driveId}/items/${ids.itemId}?$select=eTag,lastModifiedDateTime`,
        token,
      );
      metaJson = await metaRes.json();
    } catch (err) {
      // Jaringan putus / DNS gagal (ERR_NAME_NOT_RESOLVED): jangan matikan
      // dashboard — pakai salinan cache selama masih ada, coba lagi nanti
      const fallback = getCachedBuffer();
      if (fallback && cacheMeta) {
        console.warn('Gagal menghubungi SharePoint, memakai data cache:', err);
        return { buffer: fallback, fromCache: true, lastModifiedDateTime: cacheMeta.lastModifiedDateTime };
      }
      throw err;
    }
    const currentEtag: string = metaJson.eTag;
    const currentLastModified: string = metaJson.lastModifiedDateTime;
    const cachedBuffer = getCachedBuffer();
    if (cacheMeta && cachedBuffer && cacheMeta.etag === currentEtag) {
      saveCacheMeta({ etag: currentEtag, lastModifiedDateTime: currentLastModified });
      return { buffer: cachedBuffer, fromCache: true, lastModifiedDateTime: currentLastModified };
    }
    const contentRes = await graphFetch(
      `${graphConfig.graphEndpoint}/drives/${ids.driveId}/items/${ids.itemId}/content`,
      token,
    );
    const buffer = await contentRes.arrayBuffer();
    saveCacheMeta({ etag: currentEtag, lastModifiedDateTime: currentLastModified });
    saveCachedBuffer(buffer);
    return { buffer, fromCache: false, lastModifiedDateTime: currentLastModified };
  };
  return { fetchFile };
};