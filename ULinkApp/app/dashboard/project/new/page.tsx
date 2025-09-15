'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { UnifiedAuth } from '@/components/wallet/unified-auth';
import { ArrowLeft, Wallet, Upload, Save, Globe, Hash, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { ProjectService, Project } from '@/lib/services/project-service';
import { BlockchainService } from '@/lib/services/blockchain-service';

// Project creation schema
const createProjectSchema = z.object({
  title: z.string()
    .min(1, 'Project title is required')
    .max(50, 'Title must be less than 50 characters'),
  description: z.string()
    .max(150, 'Description must be less than 150 characters')
    .optional(),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(30, 'Slug must be less than 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

export default function CreateProjectPage() {
  const router = useRouter();
  const { address, isConnected, chainId } = useAccount();
  const [isCreating, setIsCreating] = useState(false);
  const [showAuthCard, setShowAuthCard] = useState(!isConnected);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      slug: '',
    }
  });

  const watchTitle = watch('title');
  const watchSlug = watch('slug');

  // Auto-generate slug from title
  useEffect(() => {
    if (watchTitle && !watchSlug) {
      const autoSlug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 30);
      setValue('slug', autoSlug);
    }
  }, [watchTitle, watchSlug, setValue]);

  // Handle wallet connection success
  const handleAuthSuccess = () => {
    setShowAuthCard(false);
    toast.success('Wallet connected successfully!');
  };

  // Create project with blockchain and Firebase integration
  const createProject = async (data: CreateProjectForm): Promise<Project> => {
    if (!address) throw new Error('Wallet not connected');

    // Check wallet connection and network
    const walletStatus = await BlockchainService.checkWalletConnection();
    if (!walletStatus.isCorrectNetwork) {
      toast.loading('Switching to Base Sepolia network...', { id: 'create-project' });
      const switched = await BlockchainService.switchToCorrectNetwork();
      if (!switched) {
        throw new Error('Please switch to Base Sepolia network');
      }
    }

    // Check if slug is available
    const slugAvailable = await ProjectService.isSlugAvailable(data.slug);
    if (!slugAvailable) {
      throw new Error('This project URL is already taken. Please choose a different one.');
    }

    // Generate project metadata
    const projectId = nanoid(12);
    const metadataHash = BlockchainService.generateMetadataHash({
      title: data.title,
      description: data.description,
      slug: data.slug,
    });

    // Step 1: Create project on blockchain
    const blockchainResult = await BlockchainService.createProject(
      {
        id: projectId,
        title: data.title,
        slug: data.slug,
        owner: address as `0x${string}`,
        metadataHash,
      },
      address as `0x${string}`
    );

    // Step 2: Create project in Firebase
    const project = await ProjectService.createProject({
      title: data.title,
      description: data.description,
      slug: data.slug,
      owner: address.toLowerCase(),
      chainId: chainId || 84532, // Base Sepolia
      txHash: blockchainResult.txHash,
      blockNumber: Number(blockchainResult.blockNumber),
      settings: {
        theme: 'default',
        layout: 'stack',
        showAnalytics: true,
        showLogo: true,
        showDescription: true,
      },
    });

    return project;
  };

  const onSubmit = async (data: CreateProjectForm) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsCreating(true);
      
      // Step 1: Validate and create project
      toast.loading('Validating project details...', { id: 'create-project' });
      const project = await createProject(data);
      
      // Step 2: Success
      toast.success('Project created successfully!', { id: 'create-project' });
      
      // Redirect to project dashboard
      router.push(`/dashboard/project/${project.id}`);
      
    } catch (error: any) {
      console.error('Project creation error:', error);
      toast.error(error.message || 'Failed to create project', { id: 'create-project' });
    } finally {
      setIsCreating(false);
    }
  };

  // Show wallet connection if not connected
  if (showAuthCard || !isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-silver-50 to-primary-50 p-4">
        <div className="mx-auto max-w-2xl pt-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
            <p className="mt-2 text-gray-600">Connect your wallet to get started</p>
          </div>

          {/* Wallet Connection */}
          <UnifiedAuth
            variant="full"
            onAuthSuccess={handleAuthSuccess}
            config={{
              connectPageUrl: '/connect',
              homePageUrl: '/dashboard',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-silver-50 to-primary-50 p-4">
      <div className="mx-auto max-w-2xl pt-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="mt-2 text-gray-600">
            Your project will be stored on Base Sepolia blockchain
          </p>
        </div>

        {/* Wallet Status */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <Wallet className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Wallet Connected</p>
                <p className="text-xs text-green-600">
                  {address?.slice(0, 6)}...{address?.slice(-4)} • Base Sepolia
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Ready
            </Badge>
          </CardContent>
        </Card>

        {/* Create Project Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-600" />
              Project Details
            </CardTitle>
            <CardDescription>
              Fill in the details for your new ULink project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Project Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Project Title *
                </Label>
                <Input
                  id="title"
                  placeholder="My Awesome Project"
                  {...register('title')}
                  className={errors.title ? 'border-red-300' : ''}
                />
                {errors.title && (
                  <p className="text-xs text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell people what this project is about..."
                  rows={3}
                  {...register('description')}
                  className={errors.description ? 'border-red-300' : ''}
                />
                {errors.description && (
                  <p className="text-xs text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Project Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Project URL *
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">ulink.dev/</span>
                  <Input
                    id="slug"
                    placeholder="my-project"
                    {...register('slug')}
                    className={`flex-1 ${errors.slug ? 'border-red-300' : ''}`}
                  />
                </div>
                {errors.slug && (
                  <p className="text-xs text-red-600">{errors.slug.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  This will be your project's public URL
                </p>
              </div>

              <Separator />

              {/* Blockchain Info */}
              <div className="rounded-lg bg-blue-50 p-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-blue-800">
                  <Globe className="h-4 w-4" />
                  Blockchain Storage
                </h3>
                <p className="mt-1 text-xs text-blue-600">
                  Your project metadata will be stored on Base Sepolia testnet for decentralized ownership
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={!isValid || isCreating}
              >
                {isCreating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Project
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}