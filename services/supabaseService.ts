import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { supabase as sharedSupabase } from '../lib/supabaseClient';

const getSupabaseClient = (): SupabaseClient => {
    return sharedSupabase;
}

// Utility to convert data URL to File object
export const dataURLtoFile = (dataurl: string, filename: string): File => {
    try {
        if (!dataurl || typeof dataurl !== 'string') {
            throw new Error("Invalid data URL: URL is null or not a string");
        }

        const arr = dataurl.split(',');
        if (arr.length < 2) {
            throw new Error("Invalid data URL format: missing data component");
        }

        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch || mimeMatch.length < 2) {
            throw new Error("Could not determine MIME type from data URL");
        }

        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, {type: mime});
    } catch (error) {
        console.error("Failed to convert data URL to file:", error);
        console.error("Data URL preview:", dataurl ? dataurl.substring(0, 100) + "..." : "null");
        throw new Error(`Failed to get data URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Uploads a file to Supabase storage and returns the public URL
export const uploadImage = async (file: File, sessionId: string): Promise<string> => {
    const supabase = getSupabaseClient();
    const fileName = `${sessionId}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;

    const { data, error } = await supabase.storage
        .from('generated-images') // Using 'generated-images' bucket that actually exists
        .upload(fileName, file);

    if (error) {
        console.error("Error uploading image to Supabase:", error);

        // More specific error messages
        if (error.message.includes('Bucket not found')) {
            throw new Error("Storage bucket 'generated-images' was not found. Please create a public bucket named 'generated-images' in your Supabase Storage section.");
        } else if (error.message.includes('Unauthorized') || error.message.includes('permission')) {
            throw new Error("Storage permission denied. Please check that the 'generated-images' bucket is public or has proper RLS policies.");
        }

        throw new Error(`Storage error: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage.from('generated-images').getPublicUrl(data.path);
    return publicUrl;
}

interface GenerationData {
    sessionId: string;
    originalImageUrl?: string | null;
    styledImageUrl: string;
    prompt: string;
    styleName: string;
    userId?: string;
    hairstyleName?: string;
    generatedImageUrl?: string;
    seed?: number;
    steps?: number;
    guidanceScale?: number;
    strength?: number;
    status?: string;
    isFavorite?: boolean;
    isShared?: boolean;
    metadata?: any;
    gender?: 'male' | 'female';
}

// Saves generation data to the 'generations' table
export const saveGeneration = async (data: GenerationData): Promise<void> => {
    const supabase = getSupabaseClient();

    // Get the current authenticated user from localStorage
    let user = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            user = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    const insertData: any = {
        session_id: data.sessionId,
        original_image_url: data.originalImageUrl || null,
        styled_image_url: data.styledImageUrl,
        generated_image_url: data.generatedImageUrl || data.styledImageUrl,
        prompt: data.prompt,
        style_name: data.styleName,
        hairstyle_name: data.hairstyleName || data.styleName,
        seed: data.seed || null,
        steps: data.steps || null,
        guidance_scale: data.guidanceScale || null,
        strength: data.strength || null,
        status: data.status || 'completed',
        is_favorite: data.isFavorite || false,
        is_shared: data.isShared || false,
        metadata: data.metadata || null,
        gender: data.gender || null
    };

    // Add user_id if user is authenticated
    if (user) {
        insertData.user_id = user.id;
    }

    const { error } = await supabase.from('generations').insert(insertData);

    if (error) {
        console.error("Error saving generation to Supabase:", error);
        throw new Error(error.message);
    }
}

// Get user profile (using users table)
export const getUserProfile = async (userId: string): Promise<any> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, full_name, email_verified, created_at, updated_at, last_login_at, country_code, phone_number, location')
        .eq('id', userId)
        .single();

    if (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }

    return data;
}

// Get user's generation history for gallery
export const getUserGenerations = async (userId: string): Promise<any[]> => {
    const supabase = getSupabaseClient();

    // Get the current authenticated user from localStorage to verify permissions
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || currentUser.id !== userId) {
        throw new Error('Unauthorized access to user generations');
    }

    // Get all generations for the authenticated user
    const { data, error } = await supabase
        .from('generations')
        .select('id, created_at, styled_image_url, generated_image_url, original_image_url, style_name, hairstyle_name, prompt, session_id, user_id, status, is_favorite, is_shared, metadata')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100); // Limit to last 100 generations

    if (error) {
        console.error("Error fetching user generations:", error);
        throw new Error(error.message);
    }

    return data || [];
}

// Delete a generation (image) from the database and optionally from storage
export const deleteGeneration = async (generationId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();

    // Verify ownership via localStorage
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || currentUser.id !== userId) {
        return { success: false, error: 'Unauthorized access' };
    }

    // Delete the row and return its data for storage cleanup
    const { data: deleted, error: deleteError } = await supabase
        .from('generations')
        .delete()
        .eq('id', generationId)
        .eq('user_id', userId)
        .select('original_image_url, styled_image_url, generated_image_url');

    if (deleteError) {
        console.error('Error deleting generation:', deleteError);
        return { success: false, error: deleteError.message };
    }

    if (!deleted || deleted.length === 0) {
        console.error('No rows deleted — check RLS policies on generations table');
        return { success: false, error: 'No rows deleted — check RLS policies' };
    }

    // Remove all associated images from storage (if they exist)
    const deletedRow = deleted[0];
    if (deletedRow) {
        const urls = [
            deletedRow.original_image_url,
            deletedRow.styled_image_url,
            deletedRow.generated_image_url,
        ];
        const paths = urls
            .filter((url): url is string => !!url && url.includes('/generated-images/'))
            .map((url) => decodeURIComponent(url.split('/generated-images/')[1]))
            .filter((path): path is string => !!path);

        // Deduplicate (styled and generated can be the same URL)
        const uniquePaths = [...new Set(paths)];

        if (uniquePaths.length > 0) {
            try {
                await supabase.storage.from('generated-images').remove(uniquePaths);
            } catch (storageError) {
                console.error('Error removing images from storage (non-critical):', storageError);
            }
        }
    }

    return { success: true };
};

// Admin-only functions
// Get all users (admin only)
export const getAllUsers = async (): Promise<any[]> => {
    const supabase = getSupabaseClient();

    // Verify admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_admin) {
        throw new Error('Unauthorized: Admin privileges required');
    }

    const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, full_name, is_admin, email_verified, created_at, updated_at, last_login_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching all users:", error);
        throw new Error(error.message);
    }

    return data || [];
};

// Toggle user admin status (admin only)
export const toggleUserAdmin = async (userId: string, isAdmin: boolean): Promise<void> => {
    const supabase = getSupabaseClient();

    // Verify admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_admin) {
        throw new Error('Unauthorized: Admin privileges required');
    }

    const { error } = await supabase
        .from('users')
        .update({
            is_admin: isAdmin,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId);

    if (error) {
        console.error("Error updating user admin status:", error);
        throw new Error(error.message);
    }
};

// Toggle user blocked status (super admin only)
export const toggleUserBlocked = async (userId: string, isBlocked: boolean): Promise<void> => {
    const supabase = getSupabaseClient();

    // Verify super admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_super_admin) {
        throw new Error('Unauthorized: Super Admin privileges required');
    }

    const { error } = await supabase
        .from('users')
        .update({
            is_blocked: isBlocked,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId);

    if (error) {
        console.error("Error updating user blocked status:", error);
        throw new Error(error.message);
    }
};

// Get user generation count (admin only)
export const getUserGenerationCount = async (userId: string): Promise<number> => {
    const supabase = getSupabaseClient();

    // Verify admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_admin) {
        throw new Error('Unauthorized: Admin privileges required');
    }

    const { count, error } = await supabase
        .from('generations')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);

    if (error) {
        console.error("Error getting user generation count:", error);
        throw new Error(error.message);
    }

    return count || 0;
};

// Get admin dashboard stats
export const getAdminStats = async (): Promise<{
    totalUsers: number;
    totalAdmins: number;
    totalGenerations: number;
    recentUsers: number;
}> => {
    const supabase = getSupabaseClient();

    // Verify admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_admin) {
        throw new Error('Unauthorized: Admin privileges required');
    }

    // Get total users
    const { count: totalUsers } = await supabase
        .from('users')
        .select('id', { count: 'exact' });

    // Get total admins
    const { count: totalAdmins } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('is_admin', true);

    // Get total generations
    const { count: totalGenerations } = await supabase
        .from('generations')
        .select('id', { count: 'exact' });

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentUsers } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .gte('created_at', sevenDaysAgo.toISOString());

    return {
        totalUsers: totalUsers || 0,
        totalAdmins: totalAdmins || 0,
        totalGenerations: totalGenerations || 0,
        recentUsers: recentUsers || 0,
    };
};

// ============================================
// User Analytics Tracking Functions
// ============================================

// Helper to increment a stat column
const incrementUserStat = async (userId: string, column: string): Promise<void> => {
    const supabase = getSupabaseClient();

    // First get current value
    const { data, error: fetchError } = await supabase
        .from('users')
        .select(column)
        .eq('id', userId)
        .single();

    if (fetchError) {
        console.error(`Error fetching ${column}:`, fetchError);
        return;
    }

    const currentValue = (data as any)?.[column] || 0;

    // Then increment
    const { error: updateError } = await supabase
        .from('users')
        .update({ [column]: currentValue + 1 })
        .eq('id', userId);

    if (updateError) {
        console.error(`Error incrementing ${column}:`, updateError);
    }
};

// Increment download count for user
export const trackDownload = async (userId: string): Promise<void> => {
    await incrementUserStat(userId, 'download_count');
};

// Increment share count for user
export const trackShare = async (userId: string): Promise<void> => {
    await incrementUserStat(userId, 'share_count');
};

// Increment custom prompt count for user
export const trackCustomPrompt = async (userId: string): Promise<void> => {
    await incrementUserStat(userId, 'custom_prompt_count');
};

// Increment generation count for user
export const trackGeneration = async (userId: string): Promise<void> => {
    await incrementUserStat(userId, 'generation_count');
};

// Get user analytics
export const getUserAnalytics = async (userId: string): Promise<{
    download_count: number;
    share_count: number;
    custom_prompt_count: number;
    generation_count: number;
} | null> => {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from('users')
        .select('download_count, share_count, custom_prompt_count, generation_count')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error getting user analytics:', error);
        return null;
    }

    return {
        download_count: data?.download_count || 0,
        share_count: data?.share_count || 0,
        custom_prompt_count: data?.custom_prompt_count || 0,
        generation_count: data?.generation_count || 0,
    };
};

// ============================================
// Google OAuth Functions
// ============================================

// Sign in with Google OAuth
export const signInWithGoogle = async (): Promise<{ error: any }> => {
    const supabase = getSupabaseClient();

    // Store that we're doing a Google OAuth flow
    sessionStorage.setItem('headz_oauth_provider', 'google');

    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}${window.location.pathname}`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    });

    return { error };
};

// Handle OAuth callback and get user session
export const handleOAuthCallback = async (): Promise<{ user: any | null; isNewUser: boolean; error: any }> => {
    const supabase = getSupabaseClient();

    try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            return { user: null, isNewUser: false, error };
        }

        if (!data.session?.user) {
            return { user: null, isNewUser: false, error: null };
        }

        const supabaseUser = data.session.user;

        // Check if user exists in our users table
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', supabaseUser.email)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116 is "not found" error, which is expected for new users
            console.error('Error fetching user:', fetchError);
        }

        if (existingUser) {
            // Existing user - update last login
            await supabase
                .from('users')
                .update({
                    last_login_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    auth_provider: 'google',
                    supabase_user_id: supabaseUser.id,
                })
                .eq('id', existingUser.id);

            return { user: existingUser, isNewUser: false, error: null };
        }

        // New user - needs profile completion
        return {
            user: {
                email: supabaseUser.email,
                supabase_user_id: supabaseUser.id,
                auth_provider: 'google',
            },
            isNewUser: true,
            error: null,
        };
    } catch (error) {
        console.error('OAuth callback error:', error);
        return { user: null, isNewUser: false, error };
    }
};

// ============================================
// User Lookup Functions
// ============================================

// Check if user exists by email (without creating)
export const checkUserByEmail = async (email: string): Promise<{ exists: boolean; user: any | null; error: any }> => {
    const supabase = getSupabaseClient();

    try {
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*, is_super_admin, is_admin')
            .eq('email', email.toLowerCase())
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error checking user:', fetchError);
            return { exists: false, user: null, error: fetchError };
        }

        if (existingUser) {
            // Check if user is blocked
            if (existingUser.is_blocked) {
                return { exists: true, user: null, error: { message: 'Your account has been blocked. Please contact support.' } };
            }

            // Check if user is pending approval
            if (!existingUser.is_approved) {
                return { exists: true, user: null, error: { message: 'Your account is pending admin approval. Please wait for approval before logging in.' } };
            }

            return { exists: true, user: existingUser, error: null };
        }

        return { exists: false, user: null, error: null };
    } catch (error) {
        console.error('Check user by email error:', error);
        return { exists: false, user: null, error };
    }
};

// Get or create user by email (used by Google sign-in)
export const getOrCreateUserByEmail = async (email: string): Promise<{ user: any | null; isNewUser: boolean; error: any }> => {
    const supabase = getSupabaseClient();

    try {
        // Check if user exists - explicitly select is_super_admin and is_admin to ensure they're returned
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*, is_super_admin, is_admin')
            .eq('email', email.toLowerCase())
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching user:', fetchError);
        }

        if (existingUser) {
            // Check if user is blocked
            if (existingUser.is_blocked) {
                return { user: null, isNewUser: false, error: { message: 'Your account has been blocked. Please contact support.' } };
            }

            // Check if user is pending approval
            if (!existingUser.is_approved) {
                return { user: null, isNewUser: false, error: { message: 'Your account is pending admin approval. Please wait for approval before logging in.' } };
            }

            // Existing user - update last login
            await supabase
                .from('users')
                .update({
                    last_login_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existingUser.id);

            return { user: existingUser, isNewUser: false, error: null };
        }

        // New user - will need profile completion
        return {
            user: { email: email.toLowerCase(), auth_provider: 'google' },
            isNewUser: true,
            error: null,
        };
    } catch (error) {
        console.error('Get or create user error:', error);
        return { user: null, isNewUser: false, error };
    }
};

// ============================================
// User Profile Functions
// ============================================

// Create new user with profile
export const createUserWithProfile = async (
    email: string,
    firstName: string,
    lastName: string,
    location?: string,
    authProvider: 'google' = 'google',
    supabaseUserId?: string,
    countryCode?: string,
    phoneNumber?: string
): Promise<{ user: any | null; error: any }> => {
    const supabase = getSupabaseClient();

    try {
        const { data, error } = await supabase
            .from('users')
            .insert({
                email: email.toLowerCase(),
                first_name: firstName,
                last_name: lastName,
                full_name: `${firstName} ${lastName}`,
                location: location || null,
                auth_provider: authProvider,
                supabase_user_id: supabaseUserId || null,
                email_verified: true,
                country_code: countryCode || null,
                phone_number: phoneNumber || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_login_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Create user error:', error);
            return { user: null, error };
        }

        return { user: data, error: null };
    } catch (error) {
        console.error('Create user with profile error:', error);
        return { user: null, error };
    }
};

// Update user profile
export const updateUserProfile = async (
    userId: string,
    firstName: string,
    lastName: string,
    location?: string,
    countryCode?: string,
    phoneNumber?: string
): Promise<{ user: any | null; error: any }> => {
    const supabase = getSupabaseClient();

    try {
        const updateData: any = {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
            location: location || null,
            updated_at: new Date().toISOString(),
        };

        // Only update phone fields if provided
        if (countryCode !== undefined) {
            updateData.country_code = countryCode || null;
        }
        if (phoneNumber !== undefined) {
            updateData.phone_number = phoneNumber || null;
        }

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Update profile error:', error);
            return { user: null, error };
        }

        return { user: data, error: null };
    } catch (error) {
        console.error('Update user profile error:', error);
        return { user: null, error };
    }
};

// Sign out from Supabase Auth (for OAuth users)
export const signOutFromSupabase = async (): Promise<{ error: any }> => {
    const supabase = getSupabaseClient();

    try {
        const { error } = await supabase.auth.signOut();
        sessionStorage.removeItem('headz_oauth_provider');
        sessionStorage.removeItem('headz_pending_action');
        return { error };
    } catch (error) {
        return { error };
    }
};

// ============================================
// Super Admin Functions
// ============================================

// Get super admin dashboard stats (aggregated totals via database-level aggregation)
export const getSuperAdminStats = async (): Promise<{
    totalDownloads: number;
    totalShares: number;
    totalGenerations: number;
    totalUsers: number;
    totalCustomPrompts: number;
    maleFavoriteStyle: string | null;
    femaleFavoriteStyle: string | null;
}> => {
    const supabase = getSupabaseClient();

    // Verify super admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_super_admin) {
        throw new Error('Unauthorized: Super Admin privileges required');
    }

    // Call database function via RPC for efficient server-side aggregation
    const { data, error } = await supabase.rpc('get_super_admin_stats');

    if (error) {
        console.error('Error fetching super admin stats:', error);
        throw new Error(error.message);
    }

    return {
        totalDownloads: data?.totalDownloads || 0,
        totalShares: data?.totalShares || 0,
        totalGenerations: data?.totalGenerations || 0,
        totalUsers: data?.totalUsers || 0,
        totalCustomPrompts: data?.totalCustomPrompts || 0,
        maleFavoriteStyle: data?.maleFavoriteStyle || null,
        femaleFavoriteStyle: data?.femaleFavoriteStyle || null,
    };
};

// Get all users with their analytics data (super admin only)
export const getAllUsersWithAnalytics = async (): Promise<any[]> => {
    const supabase = getSupabaseClient();

    // Verify super admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_super_admin) {
        throw new Error('Unauthorized: Super Admin privileges required');
    }

    const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, full_name, download_count, share_count, custom_prompt_count, generation_count, created_at, sr_no, is_blocked, is_approved, location, country_code, phone_number')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all users with analytics:', error);
        throw new Error(error.message);
    }

    return data || [];
};

// Search users with analytics data (super admin only) - server-side search
export const searchUsersWithAnalytics = async (query: string): Promise<any[]> => {
    const supabase = getSupabaseClient();

    // Verify super admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_super_admin) {
        throw new Error('Unauthorized: Super Admin privileges required');
    }

    const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, full_name, download_count, share_count, custom_prompt_count, generation_count, created_at, sr_no, is_blocked, is_approved, location, country_code, phone_number')
        .eq('is_approved', true)
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error searching users with analytics:', error);
        throw new Error(error.message);
    }

    return data || [];
};

// Get users who have custom prompts (super admin only)
export const getUsersWithCustomPrompts = async (): Promise<{
    id: string;
    email: string;
    full_name: string | null;
    custom_prompt_count: number;
}[]> => {
    const supabase = getSupabaseClient();

    // Verify super admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_super_admin) {
        throw new Error('Unauthorized: Super Admin privileges required');
    }

    const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, custom_prompt_count')
        .gt('custom_prompt_count', 0)
        .order('custom_prompt_count', { ascending: false });

    if (error) {
        console.error('Error fetching users with custom prompts:', error);
        throw new Error(error.message);
    }

    return data || [];
};

// Get actual custom prompts for a specific user (super admin only)
// Custom prompts are identified by style_name = 'AI Generated Style'
export const getUserCustomPrompts = async (userId: string): Promise<{
    id: number;
    prompt: string;
    created_at: string;
    hairstyle_name: string | null;
}[]> => {
    const supabase = getSupabaseClient();

    // Verify super admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_super_admin) {
        throw new Error('Unauthorized: Super Admin privileges required');
    }

    const { data, error } = await supabase
        .from('generations')
        .select('id, prompt, created_at, hairstyle_name')
        .eq('user_id', userId)
        .eq('style_name', 'AI Generated Style')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user custom prompts:', error);
        throw new Error(error.message);
    }

    return data || [];
};

// ============================================
// Weekly Analytics Functions (Super Admin)
// ============================================

export interface DailyCount {
    date: string;      // e.g., "Mon", "Tue", etc.
    fullDate: string;  // e.g., "2026-01-27"
    count: number;
}

export interface MonthlyCount {
    date: string;      // e.g., "Jan", "Feb", etc.
    fullDate: string;  // e.g., "January 2026"
    count: number;
}

// Helper to get day name from date
const getDayName = (date: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
};

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

// Get user registrations per day for last 7 days (super admin only)
export const getWeeklyUserRegistrations = async (): Promise<DailyCount[]> => {
    const supabase = getSupabaseClient();

    // Verify super admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_super_admin) {
        throw new Error('Unauthorized: Super Admin privileges required');
    }

    const result: DailyCount[] = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Get data for each of the last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const { count, error } = await supabase
            .from('users')
            .select('id', { count: 'exact' })
            .eq('is_approved', true)
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString());

        if (error) {
            console.error('Error fetching weekly user registrations:', error);
        }

        result.push({
            date: getDayName(date),
            fullDate: formatDate(date),
            count: count || 0,
        });
    }

    return result;
};

// Get generations per day for last 7 days (super admin only)
export const getWeeklyGenerations = async (): Promise<DailyCount[]> => {
    const supabase = getSupabaseClient();

    // Verify super admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_super_admin) {
        throw new Error('Unauthorized: Super Admin privileges required');
    }

    const result: DailyCount[] = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Get data for each of the last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const { count, error } = await supabase
            .from('generations')
            .select('id', { count: 'exact' })
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString());

        if (error) {
            console.error('Error fetching weekly generations:', error);
        }

        result.push({
            date: getDayName(date),
            fullDate: formatDate(date),
            count: count || 0,
        });
    }

    return result;
};

// ============================================
// Monthly Analytics Functions (Super Admin)
// ============================================

// Helper to get short month name from date
const getShortMonthName = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()];
};

// Helper to get full month name with year
const getFullMonthName = (date: Date): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

// Get user registrations per month for last 6 months (super admin only)
export const getMonthlyUserRegistrations = async (): Promise<MonthlyCount[]> => {
    const supabase = getSupabaseClient();

    // Verify super admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_super_admin) {
        throw new Error('Unauthorized: Super Admin privileges required');
    }

    const result: MonthlyCount[] = [];
    const today = new Date();

    // Get data for each of the last 6 months
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);

        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

        const { count, error } = await supabase
            .from('users')
            .select('id', { count: 'exact' })
            .eq('is_approved', true)
            .gte('created_at', startOfMonth.toISOString())
            .lte('created_at', endOfMonth.toISOString());

        if (error) {
            console.error('Error fetching monthly user registrations:', error);
        }

        result.push({
            date: getShortMonthName(date),
            fullDate: getFullMonthName(date),
            count: count || 0,
        });
    }

    return result;
};

// ============================================
// Approval Functions (Super Admin)
// ============================================

// Get pending users (unapproved, non-blocked)
export const getPendingUsers = async (): Promise<any[]> => {
    const supabase = getSupabaseClient();

    // Verify super admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_super_admin) {
        throw new Error('Unauthorized: Super Admin privileges required');
    }

    const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, full_name, location, country_code, phone_number, created_at')
        .eq('is_approved', false)
        .eq('is_blocked', false)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching pending users:', error);
        throw new Error(error.message);
    }

    return data || [];
};

// Approve a user
export const approveUser = async (userId: string): Promise<void> => {
    const supabase = getSupabaseClient();

    // Verify super admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_super_admin) {
        throw new Error('Unauthorized: Super Admin privileges required');
    }

    const { error } = await supabase
        .from('users')
        .update({
            is_approved: true,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

    if (error) {
        console.error('Error approving user:', error);
        throw new Error(error.message);
    }
};

// Reject (delete) a pending user
export const rejectUser = async (userId: string): Promise<void> => {
    const supabase = getSupabaseClient();

    // Verify super admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_super_admin) {
        throw new Error('Unauthorized: Super Admin privileges required');
    }

    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)
        .eq('is_approved', false);

    if (error) {
        console.error('Error rejecting user:', error);
        throw new Error(error.message);
    }
};

// Get count of pending approval users
export const getPendingApprovalCount = async (): Promise<number> => {
    const supabase = getSupabaseClient();

    // Verify super admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_super_admin) {
        throw new Error('Unauthorized: Super Admin privileges required');
    }

    const { count, error } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('is_approved', false)
        .eq('is_blocked', false);

    if (error) {
        console.error('Error fetching pending approval count:', error);
        throw new Error(error.message);
    }

    return count || 0;
};

// Get generations per month for last 6 months (super admin only)
export const getMonthlyGenerations = async (): Promise<MonthlyCount[]> => {
    const supabase = getSupabaseClient();

    // Verify super admin status
    let currentUser = null;
    try {
        const storedUser = localStorage.getItem('styleMyHair_user');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
    }

    if (!currentUser || !currentUser.is_super_admin) {
        throw new Error('Unauthorized: Super Admin privileges required');
    }

    const result: MonthlyCount[] = [];
    const today = new Date();

    // Get data for each of the last 6 months
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);

        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

        const { count, error } = await supabase
            .from('generations')
            .select('id', { count: 'exact' })
            .gte('created_at', startOfMonth.toISOString())
            .lte('created_at', endOfMonth.toISOString());

        if (error) {
            console.error('Error fetching monthly generations:', error);
        }

        result.push({
            date: getShortMonthName(date),
            fullDate: getFullMonthName(date),
            count: count || 0,
        });
    }

    return result;
};
