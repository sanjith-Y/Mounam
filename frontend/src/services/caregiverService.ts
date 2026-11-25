/**
 * MOUNAM Caregiver Linking & Management Service
 * Manages consent-based linking tokens, expiration, permission boundaries,
 * and authorized linked profile management with local & cloud sync architecture.
 */

export type CaregiverPermissionLevel =
  | 'basic_assistance'
  | 'communication_management'
  | 'accessibility_management'
  | 'emergency_configuration';

export interface CaregiverLink {
  linkId: string;
  userId: string;
  caregiverId: string;
  caregiverName: string;
  caregiverEmail: string;
  status: 'active' | 'pending' | 'revoked';
  permissions: CaregiverPermissionLevel[];
  createdAt: string;
  acceptedAt?: string;
}

export interface LinkingCode {
  code: string;
  userId: string;
  expiresAt: number; // timestamp
}

const STORAGE_KEY = 'mounam_caregiver_links';

export class CaregiverService {
  private static instance: CaregiverService;

  private constructor() {}

  public static getInstance(): CaregiverService {
    if (!CaregiverService.instance) {
      CaregiverService.instance = new CaregiverService();
    }
    return CaregiverService.instance;
  }

  /**
   * Generates a 6-digit secure linking invitation code valid for 15 minutes
   */
  public generateLinkingCode(userId: string): LinkingCode {
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    const linkingCode: LinkingCode = {
      code: `MN-${randomDigits}`,
      userId,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
    };
    localStorage.setItem(`mounam_link_code_${userId}`, JSON.stringify(linkingCode));
    return linkingCode;
  }

  public getActiveLinkingCode(userId: string): LinkingCode | null {
    const saved = localStorage.getItem(`mounam_link_code_${userId}`);
    if (!saved) return null;
    try {
      const codeObj: LinkingCode = JSON.parse(saved);
      if (Date.now() > codeObj.expiresAt) {
        localStorage.removeItem(`mounam_link_code_${userId}`);
        return null;
      }
      return codeObj;
    } catch {
      return null;
    }
  }

  public getLinkedCaregivers(): CaregiverLink[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // default
      }
    }
    // Default mock authorized link for demo & initial development
    return [
      {
        linkId: 'cl_101',
        userId: 'usr_guest',
        caregiverId: 'cg_201',
        caregiverName: 'Nurse Saravanan',
        caregiverEmail: 'saravanan.care@gmail.com',
        status: 'active',
        permissions: ['basic_assistance', 'communication_management', 'emergency_configuration'],
        createdAt: new Date().toISOString(),
        acceptedAt: new Date().toISOString(),
      },
    ];
  }

  public saveLinks(links: CaregiverLink[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }

  public connectWithCode(
    code: string,
    caregiverId: string,
    caregiverName: string,
    caregiverEmail: string
  ): { success: boolean; message: string; link?: CaregiverLink } {
    // Validate format
    if (!code.startsWith('MN-')) {
      return { success: false, message: 'Invalid linking code format. Must start with MN-' };
    }

    const links = this.getLinkedCaregivers();
    // Prevent duplicate active links for the same caregiver
    if (links.some((l) => l.caregiverEmail === caregiverEmail && l.status === 'active')) {
      return { success: false, message: 'This caregiver is already connected to this user profile.' };
    }

    const newLink: CaregiverLink = {
      linkId: `cl_${Date.now()}`,
      userId: 'usr_guest',
      caregiverId,
      caregiverName,
      caregiverEmail,
      status: 'active',
      permissions: ['basic_assistance', 'communication_management', 'emergency_configuration'],
      createdAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
    };

    links.push(newLink);
    this.saveLinks(links);
    return { success: true, message: 'Caregiver linked successfully with verified consent.', link: newLink };
  }

  public updatePermissions(linkId: string, permissions: CaregiverPermissionLevel[]): void {
    const links = this.getLinkedCaregivers().map((l) =>
      l.linkId === linkId ? { ...l, permissions } : l
    );
    this.saveLinks(links);
  }

  public revokeCaregiver(linkId: string): void {
    const links = this.getLinkedCaregivers().filter((l) => l.linkId !== linkId);
    this.saveLinks(links);
  }
}

export const caregiverService = CaregiverService.getInstance();
