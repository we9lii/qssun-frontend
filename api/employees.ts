import { supabase } from '../supabaseClient';
import { User, Role } from '../types';

const COLLECTION_NAME = 'employees'; // Changed from 'profiles'

export type NewUserPayload = Omit<User, 'id' | 'joinDate'> & { password?: string };

// Helper to map DB record (snake_case) to App User object (camelCase)
const mapDataToUser = (data: any): User => {
    if (!data) return data;
    return {
        id: data.id,
        employeeId: data.employee_id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        branch: data.branch,
        department: data.department,
        position: data.position,
        joinDate: data.created_at, // Map from Supabase's default timestamp
        employeeType: data.employee_type,
        hasImportExportPermission: data.has_import_export_permission,
        isFirstLogin: data.is_first_login,
    };
};

// Helper to map App User object (camelCase) to DB record (snake_case) for inserts/updates
const mapAppUserToDbPayload = (userPayload: Partial<User> | NewUserPayload): any => {
    const dbPayload: any = {};
    if ('id' in userPayload && userPayload.id) dbPayload.id = userPayload.id;
    if ('employeeId' in userPayload && userPayload.employeeId) dbPayload.employee_id = userPayload.employeeId;
    if ('name' in userPayload && userPayload.name) dbPayload.name = userPayload.name;
    if ('email' in userPayload && userPayload.email) dbPayload.email = userPayload.email;
    if ('phone' in userPayload && userPayload.phone) dbPayload.phone = userPayload.phone;
    if ('role' in userPayload && userPayload.role) dbPayload.role = userPayload.role;
    if ('branch' in userPayload && userPayload.branch) dbPayload.branch = userPayload.branch;
    if ('department' in userPayload && userPayload.department) dbPayload.department = userPayload.department;
    if ('position' in userPayload && userPayload.position) dbPayload.position = userPayload.position;
    if ('employeeType' in userPayload && userPayload.employeeType) dbPayload.employee_type = userPayload.employeeType;
    if ('hasImportExportPermission' in userPayload && typeof userPayload.hasImportExportPermission !== 'undefined') {
        dbPayload.has_import_export_permission = userPayload.hasImportExportPermission;
    }
    if ('isFirstLogin' in userPayload && typeof userPayload.isFirstLogin !== 'undefined') {
        dbPayload.is_first_login = userPayload.isFirstLogin;
    }
    return dbPayload;
};


export const api_users = {
  /**
   * Fetches all users from the Supabase 'employees' table.
   */
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from(COLLECTION_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching users:", error.message, error);
      throw error;
    }
    return data.map(mapDataToUser);
  },
  
  /**
   * Fetches a single user by their UUID.
   */
  getUserById: async (id: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from(COLLECTION_NAME)
      .select('*')
      .eq('id', id)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
        console.error("Error fetching user by id:", error.message, error);
        throw error;
    }
    return data ? mapDataToUser(data) : null;
  },

  /**
   * Fetches a single user by their employee ID.
   */
  getUserByEmployeeId: async (employeeId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from(COLLECTION_NAME)
      .select('*')
      .eq('employee_id', employeeId) // Fixed column name
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found, which is not an error here
        console.error("Error fetching user by employeeId:", error.message, error);
        throw error;
    }
    return data ? mapDataToUser(data) : null;
  },


  /**
   * Creates a new user in Supabase Auth and an associated profile in the 'employees' table.
   */
  createUser: async (payload: NewUserPayload): Promise<User> => {
    if (!payload.password || !payload.email) {
      throw new Error('Email and password are required for new users.');
    }
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
    });

    if (authError) {
        console.error("Supabase auth signup error:", authError.message, authError);
        throw authError;
    }
    if (!authData.user) {
        throw new Error("User creation failed in Supabase Auth.");
    }
    const authUser = authData.user;
    
    const { password, ...profilePayload } = payload;
    
    const newUserProfile: Partial<User> = {
      ...profilePayload,
      id: authUser.id,
      role: profilePayload.role || Role.Employee,
      isFirstLogin: true,
    };
    
    const dbPayload = mapAppUserToDbPayload(newUserProfile);

    const { data: profileData, error: profileError } = await supabase
      .from(COLLECTION_NAME)
      .insert(dbPayload)
      .select()
      .single();

    if (profileError) {
        console.error("Supabase profile creation error:", profileError.message, profileError);
        throw profileError;
    }
    
    return mapDataToUser(profileData);
  },

  /**
   * Completes the first-time login process for a user.
   */
  completeOnboarding: async (userId: string, updates: Pick<User, 'name' | 'phone'>, newPassword?: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
        throw new Error("Authentication error. Please log in again.");
    }

    if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
        if (passwordError) throw passwordError;
    }
    
    const dbPayload = mapAppUserToDbPayload({ ...updates, isFirstLogin: false });

    const { error: profileError } = await supabase
      .from(COLLECTION_NAME)
      .update(dbPayload)
      .eq('id', userId);
      
    if (profileError) throw profileError;
  },

  /**
   * Updates an existing employee's profile.
   */
  updateUser: async (user: Partial<User>): Promise<User> => {
      if (!user.id) throw new Error("User ID is required for updates.");
      const { id, ...updatePayload } = user;
      
      const dbPayload = mapAppUserToDbPayload(updatePayload);
      
      const { data, error } = await supabase
        .from(COLLECTION_NAME)
        .update(dbPayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapDataToUser(data);
  },

  /**
   * Deletes a user's profile from the 'employees' table.
   */
  deleteUser: async (userId: string): Promise<{ id: string }> => {
    if (!userId) throw new Error("User ID is required for deletion.");
    const { error } = await supabase.from(COLLECTION_NAME).delete().eq('id', userId);
    if (error) throw error;
    return { id: userId };
  }
};