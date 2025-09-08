import { supabase } from './supabaseClient';

/**
 * Get all records for a specific user
 * @param {string} userId - The user's ID (optional, will use current user if not provided)
 * @returns {Object} - Result object with success status and data/error
 */
export const getUserData = async (userId = null) => {
  try {
    let query = supabase
      .from('records')
      .select(`
        id,
        title,
        description,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false });

    // If userId is provided, filter by it; otherwise, RLS will handle filtering
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data || []
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Add a new record for a user
 * @param {string} userId - The user's ID (optional, will use current user if not provided)
 * @param {string} title - The record title
 * @param {string} description - The record description
 * @returns {Object} - Result object with success status and data/error
 */
export const addRecord = async (userId, title, description) => {
  try {
    // Prepare the record data
    const recordData = {
      title,
      description,
    };

    // Only add user_id if provided (RLS and trigger will handle it otherwise)
    if (userId) {
      recordData.user_id = userId;
    }

    const { data, error } = await supabase
      .from('records')
      .insert([recordData])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update an existing record
 * @param {string} recordId - The record ID to update
 * @param {string} title - The new title
 * @param {string} description - The new description
 * @returns {Object} - Result object with success status and data/error
 */
export const updateRecord = async (recordId, title, description) => {
  try {
    const { data, error } = await supabase
      .from('records')
      .update({
        title,
        description,
      })
      .eq('id', recordId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete a record
 * @param {string} recordId - The record ID to delete
 * @returns {Object} - Result object with success status
 */
export const deleteRecord = async (recordId) => {
  try {
    const { error } = await supabase
      .from('records')
      .delete()
      .eq('id', recordId);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get a single record by ID
 * @param {string} recordId - The record ID
 * @returns {Object} - Result object with success status and data/error
 */
export const getRecord = async (recordId) => {
  try {
    const { data, error } = await supabase
      .from('records')
      .select(`
        id,
        title,
        description,
        created_at,
        user_id
      `)
      .eq('id', recordId)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Search records by title or description
 * @param {string} searchTerm - The search term
 * @param {string} userId - The user's ID (optional)
 * @returns {Object} - Result object with success status and data/error
 */
export const searchRecords = async (searchTerm, userId = null) => {
  try {
    let query = supabase
      .from('records')
      .select(`
        id,
        title,
        description,
        created_at,
        user_id
      `)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data || []
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
