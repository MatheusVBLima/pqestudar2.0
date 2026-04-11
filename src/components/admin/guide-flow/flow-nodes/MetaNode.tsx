import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Type, Tag, User, FileText } from 'lucide-react';

function MetaNodeComponent({ data }: { data: any }) {
  const { title, slug, category, author_name, short_description } = data;

  return (
    <div className="bg-card border border-primary/30 rounded-[1.2rem] shadow-card w-[320px] overflow-hidden">
      <Handle type="target" position={Position.Left} className="!bg-primary !w-2.5 !h-2.5 !border-2 !border-card" />

      <div className="bg-primary/8 px-3 py-2 border-b border-primary/15 flex items-center gap-2">
        <Type className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold">Metadados</span>
        <Badge variant="outline" className="ml-auto text-[9px] px-1.5 h-4 border-primary/30 text-primary">
          META
        </Badge>
      </div>

      <div className="p-3 space-y-2 text-xs">
        <div>
          <span className="text-muted-foreground">Título:</span>
          <p className="font-medium truncate mt-0.5">{title}</p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Tag className="h-3 w-3 shrink-0" />
          <span className="truncate">{slug}</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-[10px] h-5">{category}</Badge>
          <span className="flex items-center gap-1 text-muted-foreground">
            <User className="h-3 w-3" /> {author_name}
          </span>
        </div>
        {short_description && (
          <p className="text-muted-foreground leading-relaxed line-clamp-2">
            <FileText className="h-3 w-3 inline mr-1" />
            {short_description}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-primary !w-2.5 !h-2.5 !border-2 !border-card" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-primary !w-2.5 !h-2.5 !border-2 !border-card" />
    </div>
  );
}

export const MetaNode = memo(MetaNodeComponent);
