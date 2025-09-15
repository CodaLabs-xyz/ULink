'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  Copy, 
  RefreshCw,
  Rocket,
  Shield,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getDeploymentStatus, 
  getContractInfo, 
  getDeploymentInstructions,
  validateEnvironment 
} from '@/lib/utils/deployment-status';

export function DeploymentStatus() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const status = getDeploymentStatus();
  const contracts = getContractInfo();
  const validation = validateEnvironment();

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Force page reload to check updated environment variables
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getContractIcon = (name: string) => {
    switch (name) {
      case 'ProjectRegistry':
        return <Rocket className="h-4 w-4" />;
      case 'MembershipNFT':
        return <Shield className="h-4 w-4" />;
      case 'AnalyticsTracker':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Smart Contract Deployment</CardTitle>
            <CardDescription>
              ULink contracts on {status.network} (Chain ID: {status.chainId})
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={status.isDeployed ? "default" : "secondary"}
              className={status.isDeployed ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {status.isDeployed ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Deployed
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Not Deployed
                </>
              )}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Validation Status */}
        {!validation.isValid && (
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-800">
                  Configuration Issues
                </p>
                {validation.missing.length > 0 && (
                  <div>
                    <p className="text-xs text-yellow-700">Missing environment variables:</p>
                    <ul className="text-xs text-yellow-600 ml-4 list-disc">
                      {validation.missing.map((variable) => (
                        <li key={variable}>{variable}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {validation.warnings.length > 0 && (
                  <div>
                    <p className="text-xs text-yellow-700">Warnings:</p>
                    <ul className="text-xs text-yellow-600 ml-4 list-disc">
                      {validation.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contract List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Contract Addresses</h4>
          {contracts.map((contract, index) => (
            <div key={contract.name}>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  {getContractIcon(contract.name)}
                  <div>
                    <p className="text-sm font-medium">{contract.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {contract.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={contract.isPlaceholder ? "secondary" : "outline"}
                    className={contract.isPlaceholder ? "" : "bg-green-50 text-green-700 border-green-200"}
                  >
                    {contract.isPlaceholder ? 'Placeholder' : 'Deployed'}
                  </Badge>
                  {!contract.isPlaceholder && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(contract.address)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      {contract.blockExplorer && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a 
                            href={contract.blockExplorer} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
              {index < contracts.length - 1 && <Separator />}
            </div>
          ))}
        </div>

        {/* Deployment Instructions */}
        {!status.isDeployed && (
          <div className="space-y-3">
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Deployment Instructions</h4>
              <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
                <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">
                  {getDeploymentInstructions()}
                </pre>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(getDeploymentInstructions())}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Instructions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a 
                    href="https://github.com/coinbase/build-onchain-apps" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Base Docs
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {status.isDeployed && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  All contracts deployed successfully!
                </p>
                <p className="text-xs text-green-600">
                  Your ULink platform is ready for Web3 project creation.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}