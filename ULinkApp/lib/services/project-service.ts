import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { nanoid } from 'nanoid';

// Project interfaces
export interface ProjectLink {
  id: string;
  label: string;
  url: string;
  type: 'web' | 'social' | 'calendar' | 'form';
  icon?: string;
  order: number;
  isActive: boolean;
  clicks: number;
  createdAt: number;
}

export interface ProjectSettings {
  theme: 'default' | 'dark' | 'custom';
  layout: 'stack' | 'grid' | 'masonry';
  showAnalytics: boolean;
  customDomain?: string;
  backgroundColor?: string;
  primaryColor?: string;
  fontFamily?: string;
  showLogo: boolean;
  showDescription: boolean;
}

export interface ProjectAnalytics {
  totalViews: number;
  totalClicks: number;
  uniqueVisitors: number;
  lastUpdated: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  topReferrers: Record<string, number>;
  deviceBreakdown: Record<string, number>;
  locationBreakdown: Record<string, number>;
}

export interface Project {
  // Core metadata
  id: string;
  title: string;
  description?: string;
  slug: string;
  
  // Ownership & blockchain
  owner: string; // Wallet address
  chainId: number;
  txHash?: string;
  blockNumber?: number;
  
  // Content
  logo?: string;
  heroImage?: string;
  links: ProjectLink[];
  
  // Configuration
  settings: ProjectSettings;
  
  // Analytics
  analytics: ProjectAnalytics;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
  
  // Status
  isActive: boolean;
  isPublished: boolean;
}

export class ProjectService {
  private static readonly COLLECTION = 'projects';
  
  /**
   * Create a new project
   */
  static async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const projectId = nanoid(12);
    const now = Date.now();
    
    const project: Project = {
      ...projectData,
      id: projectId,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      isPublished: false,
      links: [],
      analytics: {
        totalViews: 0,
        totalClicks: 0,
        uniqueVisitors: 0,
        lastUpdated: now,
        viewsThisWeek: 0,
        viewsThisMonth: 0,
        topReferrers: {},
        deviceBreakdown: {},
        locationBreakdown: {},
      },
      settings: {
        theme: 'default',
        layout: 'stack',
        showAnalytics: true,
        showLogo: true,
        showDescription: true,
        ...projectData.settings,
      }
    };
    
    const docRef = doc(db, this.COLLECTION, projectId);
    await setDoc(docRef, {
      ...project,
      createdAt: Timestamp.fromMillis(project.createdAt),
      updatedAt: Timestamp.fromMillis(project.updatedAt),
      'analytics.lastUpdated': Timestamp.fromMillis(project.analytics.lastUpdated),
    });
    
    return project;
  }
  
  /**
   * Get project by ID
   */
  static async getProject(projectId: string): Promise<Project | null> {
    const docRef = doc(db, this.COLLECTION, projectId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt?.toMillis() || Date.now(),
      updatedAt: data.updatedAt?.toMillis() || Date.now(),
      'analytics.lastUpdated': data.analytics?.lastUpdated?.toMillis() || Date.now(),
    } as Project;
  }
  
  /**
   * Get project by slug
   */
  static async getProjectBySlug(slug: string): Promise<Project | null> {
    const q = query(
      collection(db, this.COLLECTION),
      where('slug', '==', slug),
      where('isActive', '==', true),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toMillis() || Date.now(),
      updatedAt: data.updatedAt?.toMillis() || Date.now(),
      'analytics.lastUpdated': data.analytics?.lastUpdated?.toMillis() || Date.now(),
    } as Project;
  }
  
  /**
   * Get projects by owner (wallet address)
   */
  static async getProjectsByOwner(ownerAddress: string): Promise<Project[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('owner', '==', ownerAddress.toLowerCase()),
      where('isActive', '==', true),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
        'analytics.lastUpdated': data.analytics?.lastUpdated?.toMillis() || Date.now(),
      } as Project;
    });
  }
  
  /**
   * Update project
   */
  static async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    const docRef = doc(db, this.COLLECTION, projectId);
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.fromMillis(Date.now()),
    };
    
    // Convert timestamps if they exist in updates
    if (updates.createdAt) {
      updateData.createdAt = Timestamp.fromMillis(updates.createdAt);
    }
    if (updates.analytics?.lastUpdated) {
      updateData['analytics.lastUpdated'] = Timestamp.fromMillis(updates.analytics.lastUpdated);
    }
    
    await updateDoc(docRef, updateData);
  }
  
  /**
   * Delete project (soft delete)
   */
  static async deleteProject(projectId: string): Promise<void> {
    const docRef = doc(db, this.COLLECTION, projectId);
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: Timestamp.fromMillis(Date.now()),
    });
  }
  
  /**
   * Check if slug is available
   */
  static async isSlugAvailable(slug: string, excludeProjectId?: string): Promise<boolean> {
    let q = query(
      collection(db, this.COLLECTION),
      where('slug', '==', slug),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (excludeProjectId) {
      return querySnapshot.docs.every(doc => doc.id !== excludeProjectId);
    }
    
    return querySnapshot.empty;
  }
  
  /**
   * Add link to project
   */
  static async addLink(projectId: string, link: Omit<ProjectLink, 'id' | 'createdAt' | 'clicks'>): Promise<string> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const linkId = nanoid(8);
    const newLink: ProjectLink = {
      ...link,
      id: linkId,
      createdAt: Date.now(),
      clicks: 0,
    };
    
    const updatedLinks = [...project.links, newLink];
    
    await this.updateProject(projectId, {
      links: updatedLinks,
    });
    
    return linkId;
  }
  
  /**
   * Update link in project
   */
  static async updateLink(projectId: string, linkId: string, updates: Partial<ProjectLink>): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const updatedLinks = project.links.map(link => 
      link.id === linkId ? { ...link, ...updates } : link
    );
    
    await this.updateProject(projectId, {
      links: updatedLinks,
    });
  }
  
  /**
   * Remove link from project
   */
  static async removeLink(projectId: string, linkId: string): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const updatedLinks = project.links.filter(link => link.id !== linkId);
    
    await this.updateProject(projectId, {
      links: updatedLinks,
    });
  }
  
  /**
   * Increment link click count
   */
  static async incrementLinkClicks(projectId: string, linkId: string): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const updatedLinks = project.links.map(link => 
      link.id === linkId ? { ...link, clicks: link.clicks + 1 } : link
    );
    
    const updatedAnalytics = {
      ...project.analytics,
      totalClicks: project.analytics.totalClicks + 1,
      lastUpdated: Date.now(),
    };
    
    await this.updateProject(projectId, {
      links: updatedLinks,
      analytics: updatedAnalytics,
    });
  }
  
  /**
   * Increment project view count
   */
  static async incrementViews(projectId: string, metadata?: { 
    referrer?: string;
    device?: string;
    location?: string;
  }): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    const updatedAnalytics = {
      ...project.analytics,
      totalViews: project.analytics.totalViews + 1,
      lastUpdated: Date.now(),
    };
    
    // Update referrer stats
    if (metadata?.referrer) {
      updatedAnalytics.topReferrers = {
        ...updatedAnalytics.topReferrers,
        [metadata.referrer]: (updatedAnalytics.topReferrers[metadata.referrer] || 0) + 1,
      };
    }
    
    // Update device stats
    if (metadata?.device) {
      updatedAnalytics.deviceBreakdown = {
        ...updatedAnalytics.deviceBreakdown,
        [metadata.device]: (updatedAnalytics.deviceBreakdown[metadata.device] || 0) + 1,
      };
    }
    
    // Update location stats
    if (metadata?.location) {
      updatedAnalytics.locationBreakdown = {
        ...updatedAnalytics.locationBreakdown,
        [metadata.location]: (updatedAnalytics.locationBreakdown[metadata.location] || 0) + 1,
      };
    }
    
    await this.updateProject(projectId, {
      analytics: updatedAnalytics,
    });
  }
}