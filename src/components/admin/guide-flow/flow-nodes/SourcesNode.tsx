import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { FileText, FolderOpen, CheckCircle2, AlertTriangle, Loader2, BookOpen, RefreshCw, XCircle, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StorageFile } from '@/hooks/useGuideStorageSources';
import { Button } from '@/components/ui/button';
import { resolveStructureMapping, type StructureMapping } from '@/lib/guide-structure-mapping';

interface SourcesNodeData {
  structureFiles: StorageFile[];
  libraryFiles: StorageFile[];
  selectedLibrary: string | null;
  libraryFolders: string[];
  isLoadingStructure: boolean;
  isLoadingLibrary: boolean;
  structureError: string | null;
  libraryError: string | null;
  structureStatus?: 'idle' | 'loading' | 'success' | 'error';
  libraryStatus?: 'idle' | 'loading' | 'success' | 'error';
  onSelectLibrary?: (folder: string) => void;
  onRefresh?: () => void;
}

function SourcesNodeComponent({ data }: { data: any }) {
  const {
    structureFiles, libraryFiles, selectedLibrary, libraryFolders,
    isLoadingStructure, isLoadingLibrary, structureError, libraryError,
    structureStatus, libraryStatus,
    onSelectLibrary, onRefresh,
  } = data as SourcesNodeData;

  const hasStructure = structureFiles.length > 0;
  const hasLibrary = libraryFiles.length > 0;
  const isReady = hasStructure && hasLibrary;

  // Resolve explicit mapping
  const fileNames = structureFiles.map(f => f.name);
  const mapping = resolveStructureMapping(fileNames);
  const resolved = mapping.filter(m => m.resolvedFile);
  const missing = mapping.filter(m => !m.resolvedFile);

  return (
    <div className="bg-card border border-border rounded-[1.2rem] shadow-card w-[380px] overflow-hidden">
      <Handle type="source" position={Position.Right} className="!bg-primary !w-3 !h-3 !border-2 !border-card" />

      {/* Header */}
      <div className="bg-primary/8 px-4 py-2.5 border-b border-primary/15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Fontes do Guia</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant={isReady ? 'default' : 'secondary'} className="text-[10px] h-5">
            {isReady ? 'Pronto' : 'Incompleto'}
          </Badge>
          {onRefresh && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onRefresh}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* guide-structure: Explicit mapping */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            {isLoadingStructure ? (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            ) : structureStatus === 'error' ? (
              <XCircle className="h-3 w-3 text-destructive" />
            ) : hasStructure ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-3 w-3 text-amber-500" />
            )}
            <span className="text-xs font-medium">guide-structure</span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {resolved.length}/{mapping.length} mapeados
            </span>
          </div>

          {structureStatus && structureStatus !== 'loading' && (
            <div className="pl-4">
              <span className={cn(
                'text-[9px] px-1.5 py-0.5 rounded-full',
                structureStatus === 'success' ? 'bg-emerald-500/10 text-emerald-600' :
                structureStatus === 'error' ? 'bg-destructive/10 text-destructive' :
                'bg-muted text-muted-foreground'
              )}>
                {structureStatus === 'success' ? `✓ ${structureFiles.length} arquivo(s) no bucket` :
                 structureStatus === 'error' ? '✗ Falha na leitura' : '…'}
              </span>
            </div>
          )}

          {structureError && (
            <p className="text-[10px] text-destructive pl-4 break-all">Erro: {structureError}</p>
          )}

          {/* Dimension mapping table */}
          {hasStructure && (
            <div className="max-h-[200px] overflow-y-auto space-y-0.5 pl-2">
              {mapping.map(dim => (
                <div key={dim.key} className="flex items-start gap-1.5 text-[10px] py-0.5">
                  {dim.resolvedFile ? (
                    <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-emerald-500 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-2.5 w-2.5 shrink-0 text-amber-500 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-foreground">{dim.label}</span>
                    {dim.resolvedFile ? (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Link2 className="h-2 w-2 shrink-0" />
                        <span className="truncate">{dim.resolvedFile}</span>
                      </div>
                    ) : (
                      <p className="text-amber-600">Arquivo não encontrado</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!hasStructure && !isLoadingStructure && !structureError && (
            <p className="text-[10px] text-amber-600 pl-4">
              Nenhum arquivo encontrado no bucket guide-structure.
            </p>
          )}

          {missing.length > 0 && hasStructure && (
            <div className="bg-amber-500/10 rounded-md px-2 py-1 text-[9px] text-amber-700 dark:text-amber-400 ml-2">
              ⚠ {missing.length} dimensão(ões) sem arquivo fonte — geração parcial
            </div>
          )}
        </div>

        <div className="border-t border-border" />

        {/* guide-library section */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            {isLoadingLibrary ? (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            ) : libraryStatus === 'error' ? (
              <XCircle className="h-3 w-3 text-destructive" />
            ) : hasLibrary ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-3 w-3 text-amber-500" />
            )}
            <span className="text-xs font-medium">guide-library</span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {libraryFolders.length > 0
                ? `${libraryFolders.length} pasta${libraryFolders.length !== 1 ? 's' : ''}`
                : `${libraryFiles.length} arquivo${libraryFiles.length !== 1 ? 's' : ''}`
              }
            </span>
          </div>

          {libraryStatus && libraryStatus !== 'loading' && (
            <div className="pl-4">
              <span className={cn(
                'text-[9px] px-1.5 py-0.5 rounded-full',
                libraryStatus === 'success' ? 'bg-emerald-500/10 text-emerald-600' :
                libraryStatus === 'error' ? 'bg-destructive/10 text-destructive' :
                'bg-muted text-muted-foreground'
              )}>
                {libraryStatus === 'success' ? '✓ Bucket lido com sucesso' :
                 libraryStatus === 'error' ? '✗ Falha na leitura' : '…'}
              </span>
            </div>
          )}

          {libraryError && (
            <p className="text-[10px] text-destructive pl-4 break-all">Erro: {libraryError}</p>
          )}

          {libraryFolders.length > 0 && (
            <div className="pl-4 space-y-1">
              {libraryFolders.map(folder => (
                <button
                  key={folder}
                  onClick={() => onSelectLibrary?.(folder)}
                  className={cn(
                    'flex items-center gap-1.5 text-[10px] w-full text-left px-2 py-1 rounded-md transition-colors',
                    selectedLibrary === folder
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <FolderOpen className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{folder}</span>
                  {selectedLibrary === folder && (
                    <CheckCircle2 className="h-2.5 w-2.5 ml-auto shrink-0 text-emerald-500" />
                  )}
                </button>
              ))}
            </div>
          )}

          {libraryFolders.length === 0 && libraryFiles.length > 0 && (
            <div className="pl-4 space-y-1">
              {libraryFiles.map(f => (
                <button
                  key={f.name}
                  onClick={() => onSelectLibrary?.(f.name)}
                  className={cn(
                    'flex items-center gap-1.5 text-[10px] w-full text-left px-2 py-1 rounded-md transition-colors',
                    selectedLibrary === f.name
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <FileText className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{f.name}</span>
                  {selectedLibrary === f.name && (
                    <CheckCircle2 className="h-2.5 w-2.5 ml-auto shrink-0 text-emerald-500" />
                  )}
                </button>
              ))}
            </div>
          )}

          {selectedLibrary && libraryFolders.length > 0 && libraryFiles.length > 0 && (
            <div className="max-h-[80px] overflow-y-auto space-y-0.5 pl-6 mt-1">
              {libraryFiles.map(f => (
                <div key={f.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <FileText className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{f.name}</span>
                </div>
              ))}
            </div>
          )}

          {!isLoadingLibrary && libraryFolders.length === 0 && libraryFiles.length === 0 && !libraryError && (
            <p className="text-[10px] text-amber-600 pl-4">
              Nenhum arquivo encontrado no bucket guide-library.
            </p>
          )}

          {!selectedLibrary && !isLoadingLibrary && (libraryFolders.length > 0 || libraryFiles.length > 0) && (
            <p className="text-[10px] text-amber-600 pl-4">
              Selecione uma biblioteca para gerar com base factual.
            </p>
          )}
        </div>

        {/* Overall status */}
        <div className={cn(
          'rounded-lg px-3 py-2 text-[10px]',
          isReady && missing.length === 0 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
          hasStructure || hasLibrary ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' :
          'bg-destructive/10 text-destructive'
        )}>
          {isReady && missing.length === 0
            ? '✅ Fontes completas — todas as dimensões mapeadas'
            : isReady && missing.length > 0
            ? `⚠ ${resolved.length}/${mapping.length} dimensões mapeadas — geração parcial`
            : !hasStructure && !hasLibrary
            ? '⚠ Sem fontes — geração será genérica e não validada'
            : !hasStructure
            ? '⚠ Sem diretrizes editoriais — validação incompleta'
            : '⚠ Selecione uma biblioteca factual para geração fundamentada'
          }
        </div>
      </div>
    </div>
  );
}

export const SourcesNode = memo(SourcesNodeComponent);
