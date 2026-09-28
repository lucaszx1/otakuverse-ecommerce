import { ImageAssetMap } from './storeData';

export interface UserProfile {
  id: string;
  fullName: string;
  nickname: string;
  email: string;
  cpf: string;
  phone: string;
  password?: string;
  collectorTitle: string;
  bio: string;
  favoriteTags: string[];
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface OrderRecord {
  id: string;
  userEmail: string;
  userName: string;
  createdAt: string;
  items: {
    id: string;
    title: string;
    qty: number;
    price: number;
    imageKey?: keyof ImageAssetMap;
    scaleTag?: string;
  }[];
  subtotal: number;
  discount: number;
  pixDiscount: number;
  total: number;
  paymentMethod: 'pix' | 'card' | 'boleto';
  paymentDetails: string;
  status: 'Pago • Em Separação no Cofre' | 'Aguardando Confirmação' | 'Enviado • Sedex Blindado';
  shippingAddress: string;
}

const USERS_KEY = 'otakuverse-users';
const CURRENT_USER_KEY = 'otakuverse-current-user';
const ORDERS_KEY = 'otakuverse-orders';

export const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr-akira-01',
  fullName: 'Kenji Akira Takahashi',
  nickname: 'spike.spiegel',
  email: 'colecionador@neo.tokyo',
  cpf: '418.920.338-09',
  phone: '(11) 98765-4321',
  password: '123456',
  collectorTitle: 'Curador de Figures 1/7',
  bio: 'Colecionador focado em estátuas de escala 1/7, edições limitadas de Dark Fantasy e Mecha clássico importados diretamente de Akihabara.',
  favoriteTags: ['Mecha / Gunpla', 'Cyberpunk', 'Escalas 1/7 & 1/4'],
  cep: '01310-200',
  street: 'Av. Paulista',
  number: '1578',
  complement: 'Apto 142 - Bela Vista',
  neighborhood: 'Bela Vista',
  city: 'São Paulo - SP',
  createdAt: '15/03/2025'
};

export function getStoredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const initial = [DEFAULT_DEMO_USER];
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(initial));
  } catch {
    // ignore
  }
  return initial;
}

export function getCurrentStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      return JSON.parse(raw) as UserProfile;
    }
  } catch {
    // ignore
  }
  return null;
}

export function setCurrentStoredUser(user: UserProfile | null): void {
  try {
    if (!user) {
      localStorage.removeItem(CURRENT_USER_KEY);
    } else {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
  } catch {
    // ignore
  }
}

export function registerStoredUser(
  data: Omit<UserProfile, 'id' | 'createdAt'>
): { user: UserProfile; isNew: boolean } {
  const users = getStoredUsers();
  const normalizedEmail = data.email.trim().toLowerCase();
  const existingIdx = users.findIndex(
    (u) => u.email.trim().toLowerCase() === normalizedEmail
  );

  const newUser: UserProfile = {
    ...data,
    id: existingIdx >= 0 ? users[existingIdx].id : `usr-${Date.now()}`,
    createdAt:
      existingIdx >= 0
        ? users[existingIdx].createdAt
        : new Date().toLocaleDateString('pt-BR')
  };

  if (existingIdx >= 0) {
    users[existingIdx] = newUser;
  } else {
    users.unshift(newUser);
  }

  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  } catch {
    // ignore
  }

  return { user: newUser, isNew: existingIdx === -1 };
}

export function authenticateStoredUser(
  identity: string,
  password: string
): { success: boolean; user?: UserProfile; error?: string } {
  const users = getStoredUsers();
  const cleanId = identity.trim().toLowerCase();

  const matched = users.find(
    (u) =>
      u.email.trim().toLowerCase() === cleanId ||
      u.nickname.trim().toLowerCase() === cleanId ||
      u.fullName.trim().toLowerCase() === cleanId
  );

  if (!matched) {
    return {
      success: false,
      error: 'Usuário não encontrado no cofre. Verifique seu e-mail/apelido ou crie sua conta.'
    };
  }

  if (matched.password && matched.password !== password) {
    return {
      success: false,
      error: 'Senha incorreta para esta conta de colecionador.'
    };
  }

  setCurrentStoredUser(matched);
  return { success: true, user: matched };
}

export function updateStoredUserProfile(updated: UserProfile): UserProfile {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === updated.id || u.email === updated.email);
  if (idx >= 0) {
    users[idx] = updated;
  } else {
    users.unshift(updated);
  }
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export function getStoredOrders(): OrderRecord[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  const seedOrder: OrderRecord = {
    id: 'OV-88412',
    userEmail: DEFAULT_DEMO_USER.email,
    userName: DEFAULT_DEMO_USER.fullName,
    createdAt: '10/05/2025 às 14:22',
    items: [
      {
        id: 'nendoroid-lyra',
        title: 'Nendoroid Sorceress Lyra DX',
        qty: 1,
        price: 389.0,
        imageKey: 'nendoroidLyra',
        scaleTag: 'Nendoroid'
      }
    ],
    subtotal: 389.0,
    discount: 38.9,
    pixDiscount: 17.5,
    total: 332.6,
    paymentMethod: 'pix',
    paymentDetails: 'Pix Instantâneo (-5% OFF)',
    status: 'Enviado • Sedex Blindado',
    shippingAddress: 'Av. Paulista, 1578 - São Paulo/SP (CEP 01310-200)'
  };
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify([seedOrder]));
  } catch {
    // ignore
  }
  return [seedOrder];
}

export function addStoredOrder(order: OrderRecord): OrderRecord[] {
  const orders = getStoredOrders();
  const next = [order, ...orders];
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}
