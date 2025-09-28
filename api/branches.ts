import { supabase } from '../supabaseClient';
import { Branch } from '../types';

const TABLE_NAME = 'branches';

export type NewBranchPayload = Omit<Branch, 'id' | 'creationDate'>;
export type UpdateBranchPayload = Partial<Branch> & { id: string };

const mapDbBranchToAppBranch = (dbBranch: any): Branch => {
    if (!dbBranch) return dbBranch;
    return {
        id: dbBranch.id,
        name: dbBranch.name,
        location: dbBranch.location,
        phone: dbBranch.phone,
        manager: dbBranch.manager,
        creationDate: dbBranch.created_at, // Use created_at from Supabase
    };
};

const mapAppBranchToDbBranch = (appBranch: Partial<Branch>) => {
    // Exclude creationDate as we now rely on created_at
    const { creationDate, ...rest } = appBranch;
    const dbBranch: {[key: string]: any} = { ...rest };
    return dbBranch;
};

export const api_branches = {
  /**
   * Fetches all branches from the database.
   */
  getBranches: async (): Promise<Branch[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false }); // Order by the default timestamp
      
    if (error) {
      console.error("Error fetching branches:", error.message, error);
      throw new Error(error.message);
    }
    return data.map(mapDbBranchToAppBranch);
  },

  /**
   * Creates a new branch in the database.
   */
  createBranch: async (branchData: NewBranchPayload): Promise<Branch> => {
    // Do not include creation_date; Supabase handles created_at automatically
    const newBranch = {
        ...branchData,
    };
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert(newBranch)
        .select()
        .single();
    
    if (error) {
        console.error("Error creating branch:", error.message, error);
        throw new Error(error.message);
    }
    return mapDbBranchToAppBranch(data);
  },

  /**
   * Updates an existing branch.
   */
  updateBranch: async (branchData: UpdateBranchPayload): Promise<Branch> => {
    const { id, ...updatePayload } = branchData;
    const dbPayload = mapAppBranchToDbBranch(updatePayload);
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(dbPayload)
        .eq('id', id)
        .select()
        .single();
    
    if (error) {
        console.error("Error updating branch:", error.message, error);
        throw new Error(error.message);
    }
    return mapDbBranchToAppBranch(data);
  },

  /**
   * Deletes a branch by its ID.
   */
  deleteBranch: async (branchId: string): Promise<{ id: string }> => {
    const { error } = await supabase.from(TABLE_NAME).delete().match({ id: branchId });
    if (error) {
        console.error("Error deleting branch:", error.message, error);
        throw new Error(error.message);
    }
    return { id: branchId };
  }
};