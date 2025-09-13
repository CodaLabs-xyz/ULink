'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CreatorProfileProps {
  address: `0x${string}`;
  className?: string;
}

export function CreatorProfile({ address, className }: CreatorProfileProps) {
  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className={cn("border-silver-200", className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary-100 text-primary-600 text-sm">
              {address.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base text-text-primary">
                Creator
              </h3>
              <Badge variant="secondary" className="text-xs">
                Verified
              </Badge>
            </div>
            <p className="text-sm text-text-secondary truncate">
              {shortenAddress(address)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}