import { supabase } from './supabase';

export const AuthService = {
  /**
   * Signs up a new user and creates their profile entry in Supabase/MockDB.
   * @param {string} email
   * @param {string} password
   * @param {object} profileData - Mexico specific: full_name, phone, state, municipality, colonia, preferred_payment_methods
   */
  async signUp(email, password, profileData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: profileData
        }
      });
      
      if (error) throw error;
      
      // In real Supabase, a trigger creates a profile row in the 'profiles' table.
      // But we can double check and enforce profile creations here for total reliability.
      if (data?.user) {
        const profileRow = {
          id: data.user.id,
          email,
          full_name: profileData.full_name,
          phone: profileData.phone,
          state: profileData.state,
          municipality: profileData.municipality,
          colonia: profileData.colonia,
          preferred_payment_methods: profileData.preferred_payment_methods,
          is_ine_verified: false,
          created_at: new Date().toISOString()
        };
        
        // Insert/upsert into profile table
        await supabase.from('profiles').insert(profileRow).select();
      }

      return { user: data.user, error: null };
    } catch (err) {
      console.error("[AuthService] Error during registration:", err);
      return { user: null, error: err };
    }
  },

  /**
   * Authenticates user using email and password.
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { user: data.user, error: null };
    } catch (err) {
      console.error("[AuthService] Error during login:", err);
      return { user: null, error: err };
    }
  },

  /**
   * Logs out active user.
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error("[AuthService] Error logging out:", err);
      return { error: err };
    }
  },

  /**
   * Gets current active user session.
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (err) {
      return null;
    }
  },

  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // Fallback: If no profile exists (e.g. registration was interrupted or DB was resetting), auto-repair it
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        
        if (user && user.id === userId) {
          console.warn("[AuthService] Profile missing. Attempting auto-repair...");
          const newProfile = {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email.split('@')[0],
            phone: user.user_metadata?.phone || '',
            state: user.user_metadata?.state || '',
            municipality: user.user_metadata?.municipality || '',
            colonia: user.user_metadata?.colonia || '',
            preferred_payment_methods: user.user_metadata?.preferred_payment_methods || ['cash'],
            is_ine_verified: false
          };
          
          const { data: createdData, error: insertError } = await supabase.from('profiles').insert(newProfile).select().single();
          if (!insertError && createdData) {
            return createdData;
          }
        }
        throw error;
      }
      return data;
    } catch (err) {
      console.error(`[AuthService] Error fetching profile ${userId}:`, err);
      return null;
    }
  },

  /**
   * Updates an existing profile record.
   */
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error(`[AuthService] Error updating profile ${userId}:`, err);
      return { data: null, error: err };
    }
  },

  /**
   * Mock-uploads an INE card photo.
   * Encodes the image to base64, stores it on the user profile, and sets verification to pending.
   * @param {string} userId
   * @param {File} file
   */
  async uploadIne(userId, file) {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Data = reader.result;
            // Update profile with the base64 URL representing the INE attachment
            const { error } = await this.updateProfile(userId, {
              ine_attachment_url: base64Data,
              is_ine_verified: false // Set to false (pending review state)
            });
            if (error) throw error;
            resolve({ success: true, base64: base64Data });
          } catch (e) {
            reject(e);
          }
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });
    } catch (err) {
      console.error("[AuthService] Error uploading INE:", err);
      return { success: false, error: err };
    }
  }
};
