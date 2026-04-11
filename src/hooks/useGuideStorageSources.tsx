import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StorageFile {
  name: string;
  id?: string;
  size?: number;
  created_at?: string;
  updated_at?: string;
}

export interface StorageSources {
  structureFiles: StorageFile[];
  libraryFolders: string[];
  libraryFiles: StorageFile[];
  isLoadingStructure: boolean;
  isLoadingLibrary: boolean;
  structureError: string | null;
  libraryError: string | null;
  selectedLibrary: string | null;
  setSelectedLibrary: (folder: string | null) => void;
  refreshAll: () => void;
}

export function useGuideStorageSources(): StorageSources {
  const [structureFiles, setStructureFiles] = useState<StorageFile[]>([]);
  const [libraryFolders, setLibraryFolders] = useState<string[]>([]);
  const [libraryFiles, setLibraryFiles] = useState<StorageFile[]>([]);
  const [isLoadingStructure, setIsLoadingStructure] = useState(true);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);
  const [structureError, setStructureError] = useState<string | null>(null);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null);

  const loadStructure = useCallback(async () => {
    setIsLoadingStructure(true);
    setStructureError(null);
    try {
      const { data, error } = await supabase.storage.from('guide-structure').list('', {
        sortBy: { column: 'name', order: 'asc' },
      });
      if (error) throw error;
      // Filter out .emptyFolderPlaceholder and folders
      const files = (data ?? []).filter(f => f.name !== '.emptyFolderPlaceholder' && (f.metadata?.size ?? f.id));
      setStructureFiles(files.map(f => ({ name: f.name, id: f.id, size: f.metadata?.size, created_at: f.created_at, updated_at: f.updated_at })));
    } catch (err: any) {
      setStructureError(err.message);
      setStructureFiles([]);
    } finally {
      setIsLoadingStructure(false);
    }
  }, []);

  const loadLibraryFolders = useCallback(async () => {
    setIsLoadingLibrary(true);
    setLibraryError(null);
    try {
      const { data, error } = await supabase.storage.from('guide-library').list('', {
        sortBy: { column: 'name', order: 'asc' },
      });
      if (error) throw error;
      // Items without metadata.size are folders; items with it are root files
      const items = data ?? [];
      const folders: string[] = [];
      const rootFiles: StorageFile[] = [];
      for (const item of items) {
        if (item.name === '.emptyFolderPlaceholder') continue;
        if (!item.id) {
          // It's a folder
          folders.push(item.name);
        } else {
          rootFiles.push({ name: item.name, id: item.id, size: item.metadata?.size, created_at: item.created_at, updated_at: item.updated_at });
        }
      }
      setLibraryFolders(folders);
      // If no folder selected, show root files
      if (!selectedLibrary) {
        setLibraryFiles(rootFiles);
      }
    } catch (err: any) {
      setLibraryError(err.message);
      setLibraryFolders([]);
    } finally {
      setIsLoadingLibrary(false);
    }
  }, [selectedLibrary]);

  // Load files inside selected library folder
  useEffect(() => {
    if (!selectedLibrary) return;
    const loadFolderFiles = async () => {
      setIsLoadingLibrary(true);
      try {
        const { data, error } = await supabase.storage.from('guide-library').list(selectedLibrary, {
          sortBy: { column: 'name', order: 'asc' },
        });
        if (error) throw error;
        const files = (data ?? []).filter(f => f.name !== '.emptyFolderPlaceholder' && f.id);
        setLibraryFiles(files.map(f => ({ name: f.name, id: f.id, size: f.metadata?.size, created_at: f.created_at, updated_at: f.updated_at })));
      } catch (err: any) {
        setLibraryError(err.message);
        setLibraryFiles([]);
      } finally {
        setIsLoadingLibrary(false);
      }
    };
    loadFolderFiles();
  }, [selectedLibrary]);

  useEffect(() => {
    loadStructure();
    loadLibraryFolders();
  }, [loadStructure, loadLibraryFolders]);

  const refreshAll = useCallback(() => {
    loadStructure();
    loadLibraryFolders();
  }, [loadStructure, loadLibraryFolders]);

  return {
    structureFiles,
    libraryFolders,
    libraryFiles,
    isLoadingStructure,
    isLoadingLibrary,
    structureError,
    libraryError,
    selectedLibrary,
    setSelectedLibrary,
    refreshAll,
  };
}
