/**
 * MOUNAM Emergency Contact Service
 * Manages prioritized emergency contacts, phone dialer actions, and local offline persistence.
 */

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: 'primary' | 'secondary' | 'general';
  notes?: string;
  createdAt: string;
}

const STORAGE_KEY = 'mounam_emergency_contacts';

const DEFAULT_CONTACTS: EmergencyContact[] = [
  {
    id: 'emg_c1',
    name: 'Family Primary Contact',
    phone: '+91 98765 43210',
    relationship: 'Family Member',
    priority: 'primary',
    notes: 'Lives nearby, has house key',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'emg_c2',
    name: 'Primary Caregiver / Nurse',
    phone: '+91 98765 01234',
    relationship: 'Caregiver',
    priority: 'secondary',
    notes: 'Available for daily medical assistance',
    createdAt: new Date().toISOString(),
  },
];

export class EmergencyContactService {
  private static instance: EmergencyContactService;

  private constructor() {}

  public static getInstance(): EmergencyContactService {
    if (!EmergencyContactService.instance) {
      EmergencyContactService.instance = new EmergencyContactService();
    }
    return EmergencyContactService.instance;
  }

  public getContacts(): EmergencyContact[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // default
      }
    }
    return DEFAULT_CONTACTS;
  }

  public saveContacts(contacts: EmergencyContact[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }

  public addContact(contact: Omit<EmergencyContact, 'id' | 'createdAt'>): EmergencyContact {
    const contacts = this.getContacts();
    const newContact: EmergencyContact = {
      ...contact,
      id: `ec_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    contacts.push(newContact);
    this.saveContacts(contacts);
    return newContact;
  }

  public updateContact(id: string, updates: Partial<EmergencyContact>): void {
    const contacts = this.getContacts().map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.saveContacts(contacts);
  }

  public deleteContact(id: string): void {
    const contacts = this.getContacts().filter((c) => c.id !== id);
    this.saveContacts(contacts);
  }
}

export const emergencyContactService = EmergencyContactService.getInstance();
