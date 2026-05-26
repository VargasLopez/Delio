import { createClient } from '@supabase/supabase-js';
import { notification } from '../components/common/notification';

// Safe environment variables read (compatible with both Vite compiling and raw browsers)
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

// Check if credentials exist to activate the real Supabase client
const isRealSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL');

class MockQueryBuilder {
  constructor(tableName, mockClient) {
    this.tableName = tableName;
    this.mockClient = mockClient;
    this.filters = [];
    this.orderCol = null;
    this.orderAscending = false;
    this.insertedRows = null;
    this.updatedFields = null;
  }

  select(queryStr = '*') {
    return this;
  }

  eq(column, value) {
    this.filters.push({ column, value });
    return this;
  }

  order(orderCol, { ascending = false } = {}) {
    this.orderCol = orderCol;
    this.orderAscending = ascending;
    return this;
  }

  insert(row) {
    const items = JSON.parse(localStorage.getItem(`delio_${this.tableName}`) || '[]');
    const newRow = {
      id: 'row-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      ...row
    };
    items.push(newRow);
    localStorage.setItem(`delio_${this.tableName}`, JSON.stringify(items));
    
    this.mockClient.broadcastChannelEvent(this.tableName, 'INSERT', newRow);
    this.insertedRows = [newRow];
    return this;
  }

  update(updates) {
    this.updatedFields = updates;
    return this;
  }

  async execute() {
    await new Promise(r => setTimeout(r, 100));
    
    // If it was an insert operation
    if (this.insertedRows) {
      return { data: this.insertedRows, error: null };
    }

    // If it is an update operation
    if (this.updatedFields) {
      const items = JSON.parse(localStorage.getItem(`delio_${this.tableName}`) || '[]');
      let updatedRows = [];
      const nextItems = items.map(item => {
        let isMatch = true;
        for (const filter of this.filters) {
          if (item[filter.column] !== filter.value) {
            isMatch = false;
            break;
          }
        }
        
        if (isMatch) {
          const updated = { ...item, ...this.updatedFields };
          updatedRows.push(updated);
          return updated;
        }
        return item;
      });
      
      localStorage.setItem(`delio_${this.tableName}`, JSON.stringify(nextItems));
      
      updatedRows.forEach(row => {
        this.mockClient.broadcastChannelEvent(this.tableName, 'UPDATE', row);
      });
      
      return { data: updatedRows, error: null };
    }

    // If it is a normal select/query operation
    const items = JSON.parse(localStorage.getItem(`delio_${this.tableName}`) || '[]');
    let filtered = [...items];
    
    // Apply filters sequentially
    for (const filter of this.filters) {
      filtered = filtered.filter(item => item[filter.column] === filter.value);
    }

    // Apply sorting
    if (this.orderCol) {
      filtered.sort((a, b) => {
        const valA = new Date(a[this.orderCol]);
        const valB = new Date(b[this.orderCol]);
        return this.orderAscending ? valA - valB : valB - valA;
      });
    }

    return { data: filtered, error: null };
  }

  // Promise-compatible thenable for native async/await queries without calling .execute()
  then(onfulfilled, onrejected) {
    return this.execute().then(onfulfilled, onrejected);
  }

  async single() {
    const { data } = await this.execute();
    const item = data && data.length > 0 ? data[0] : null;
    return { data: item, error: item ? null : { message: "No encontrado" } };
  }
}

class MockSupabaseClient {
  constructor() {
    console.warn("[Delio] ⚠️ Supabase credentials missing or default. Booting in Local Storage Mock Mode.");
    this.initMockDatabase();
    this.listeners = [];
  }

  initMockDatabase() {
    if (!localStorage.getItem('delio_profiles')) {
      localStorage.setItem('delio_profiles', JSON.stringify([]));
    }
    if (!localStorage.getItem('delio_jobs')) {
      // Seed initial sample jobs for premium demonstration
      const sampleJobs = [
        {
          id: 'sample-job-1',
          poster_id: 'sample-user-1',
          poster_name: 'Don Ricardo G.',
          title: 'Mandado rápido: Comprar despensa en Chedraui',
          description: 'Necesito que me compren una despensa básica de 8 artículos y la traigan a mi casa en Narvarte Oriente. Pago en efectivo al entregar. Entrego lista detallada por chat.',
          category: 'mandado',
          budget: 150,
          payment_frequency: 'Total',
          state: 'CDMX',
          municipality: 'Benito Juárez',
          colonia: 'Narvarte',
          status: 'open',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
        },
        {
          id: 'sample-job-2',
          poster_id: 'sample-user-2',
          poster_name: 'María Inés',
          title: 'Limpieza completa de departamento',
          description: 'Se solicita apoyo para limpieza profunda de departamento de 2 recámaras. Se proporciona material. Preferible pago por transferencia SPEI.',
          category: 'limpieza',
          budget: 450,
          payment_frequency: 'Total',
          state: 'CDMX',
          municipality: 'Cuauhtémoc',
          colonia: 'Roma Norte',
          status: 'open',
          created_at: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
        },
        {
          id: 'sample-job-3',
          poster_id: 'sample-user-3',
          poster_name: 'Eduardo Torres',
          title: 'Reparar fuga en tubería de baño',
          description: 'Tengo una fuga en el lavabo del baño principal. Gotea bastante y hay que cambiar la junta o empaque. Pago inmediato en efectivo o Spin OXXO.',
          category: 'reparaciones',
          budget: 350,
          payment_frequency: 'Total',
          state: 'CDMX',
          municipality: 'Miguel Hidalgo',
          colonia: 'Polanco',
          status: 'open',
          created_at: new Date(Date.now() - 3600000 * 20).toISOString() // 20 hours ago
        }
      ];
      localStorage.setItem('delio_jobs', JSON.stringify(sampleJobs));
    }
    if (!localStorage.getItem('delio_chats')) {
      localStorage.setItem('delio_chats', JSON.stringify([]));
    }
    if (!localStorage.getItem('delio_chat_messages')) {
      localStorage.setItem('delio_chat_messages', JSON.stringify([]));
    }
    
    // Set mock active user to null initially
    if (!sessionStorage.getItem('delio_current_user')) {
      sessionStorage.setItem('delio_current_user', null);
    }
  }

  // Auth mock API
  get auth() {
    const self = this;
    return {
      async signUp({ email, password, options }) {
        await new Promise(r => setTimeout(r, 600));
        const profiles = JSON.parse(localStorage.getItem('delio_profiles'));
        
        if (profiles.some(p => p.email === email)) {
          return { data: null, error: { message: "El correo ya está registrado." } };
        }

        const id = 'user-' + Math.random().toString(36).substr(2, 9);
        const newProfile = {
          id,
          email,
          full_name: options?.data?.full_name || email.split('@')[0],
          phone: options?.data?.phone || '',
          preferred_payment_methods: options?.data?.preferred_payment_methods || ['cash'],
          is_ine_verified: false,
          state: options?.data?.state || '',
          municipality: options?.data?.municipality || '',
          colonia: options?.data?.colonia || '',
          created_at: new Date().toISOString()
        };

        profiles.push(newProfile);
        localStorage.setItem('delio_profiles', JSON.stringify(profiles));
        
        const sessionUser = { id, email, user_metadata: options?.data };
        sessionStorage.setItem('delio_current_user', JSON.stringify(sessionUser));
        self.triggerAuthChange('SIGNED_IN', sessionUser);
        
        return { data: { user: sessionUser }, error: null };
      },

      async signInWithPassword({ email, password }) {
        await new Promise(r => setTimeout(r, 600));
        const profiles = JSON.parse(localStorage.getItem('delio_profiles'));
        const userProfile = profiles.find(p => p.email === email);
        
        if (!userProfile) {
          // Allow login bypass for mock demonstration with new accounts!
          const id = 'user-' + Math.random().toString(36).substr(2, 9);
          const newProfile = {
            id,
            email,
            full_name: email.split('@')[0],
            phone: '5512345678',
            preferred_payment_methods: ['cash', 'spei'],
            is_ine_verified: true,
            state: 'CDMX',
            municipality: 'Benito Juárez',
            colonia: 'Narvarte',
            created_at: new Date().toISOString()
          };
          profiles.push(newProfile);
          localStorage.setItem('delio_profiles', JSON.stringify(profiles));
          
          const sessionUser = { id, email, user_metadata: newProfile };
          sessionStorage.setItem('delio_current_user', JSON.stringify(sessionUser));
          self.triggerAuthChange('SIGNED_IN', sessionUser);
          return { data: { user: sessionUser }, error: null };
        }

        const sessionUser = { id: userProfile.id, email: userProfile.email, user_metadata: userProfile };
        sessionStorage.setItem('delio_current_user', JSON.stringify(sessionUser));
        self.triggerAuthChange('SIGNED_IN', sessionUser);
        return { data: { user: sessionUser }, error: null };
      },

      async signOut() {
        sessionStorage.setItem('delio_current_user', null);
        self.triggerAuthChange('SIGNED_OUT', null);
        return { error: null };
      },

      async getUser() {
        const userStr = sessionStorage.getItem('delio_current_user');
        if (!userStr || userStr === 'null') return { data: { user: null }, error: null };
        return { data: { user: JSON.parse(userStr) }, error: null };
      },

      onAuthStateChange(callback) {
        self.listeners.push(callback);
        const userStr = sessionStorage.getItem('delio_current_user');
        const user = userStr && userStr !== 'null' ? JSON.parse(userStr) : null;
        callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null);
        
        return {
          data: {
            subscription: {
              unsubscribe() {
                self.listeners = self.listeners.filter(cb => cb !== callback);
              }
            }
          }
        };
      }
    };
  }

  triggerAuthChange(event, session) {
    this.listeners.forEach(cb => cb(event, session ? { user: session } : null));
  }

  // Database mock API - delegates fully to MockQueryBuilder
  from(tableName) {
    return new MockQueryBuilder(tableName, this);
  }

  // Mock channels for real-time chat updates
  channel(channelName) {
    const self = this;
    const key = `channel-${channelName}`;
    
    return {
      on(eventType, filter, callback) {
        if (!window[key]) window[key] = [];
        window[key].push({ eventType, filter, callback });
        return this;
      },
      subscribe() {
        console.log(`[Delio Mock Channel] Subscribed to ${channelName}`);
        return this;
      },
      unsubscribe() {
        window[key] = [];
        return this;
      }
    };
  }

  broadcastChannelEvent(tableName, eventType, record) {
    // Find all window registers that listen to database changes
    // e.g. listening to 'schema-db-changes' or chat instances
    Object.keys(window).forEach(prop => {
      if (prop.startsWith('channel-')) {
        const subscriptions = window[prop] || [];
        subscriptions.forEach(sub => {
          if (sub.eventType === 'postgres_changes') {
            const isMatch = sub.filter.table === tableName;
            if (isMatch) {
              sub.callback({
                eventType,
                new: record
              });
            }
          }
        });
      }
    });
  }
}

// Instantiate either real Supabase or Local Mock
export const supabase = isRealSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new MockSupabaseClient();

// Export a flag so other components can alert or log modes
export const isMockMode = !isRealSupabaseConfigured;
