import { supabase } from './supabase';

export const DbService = {
  /**
   * Fetches active jobs/errands from database with filters.
   * Supports filtering by State, Municipality, Colonia, and Category.
   * @param {object} filters - state, municipality, colonia, category
   */
  async getJobs(filters = {}) {
    try {
      // In Mock Mode, this maps directly to our localStorage filter routine
      // In Live mode, this dynamically appends where/eq blocks
      let query = supabase.from('jobs').select('*');

      // State Filter
      if (filters.state) {
        // If real, query = query.eq('state', filters.state)
        // If mock, the mock from() implementation supports eq chain
        query = query.eq('state', filters.state);
      }

      // Municipality Filter
      if (filters.municipality) {
        query = query.eq('municipality', filters.municipality);
      }

      // Colonia Filter
      if (filters.colonia) {
        query = query.eq('colonia', filters.colonia);
      }

      // Category Filter
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      // Execute order descending
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      
      // Filter out completed/cancelled jobs in frontend if not covered in mock query
      return { data: data.filter(job => job.status === 'open'), error: null };
    } catch (err) {
      console.error("[DbService] Error fetching jobs:", err);
      return { data: [], error: err };
    }
  },

  /**
   * Fetches a single job detail.
   */
  async getJob(jobId) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error(`[DbService] Error fetching job ${jobId}:`, err);
      return { data: null, error: err };
    }
  },

  /**
   * Posts a new job listing to the board.
   * @param {object} jobData - title, description, category, budget, state, municipality, colonia, poster_id, poster_name
   */
  async postJob(jobData) {
    try {
      const jobRow = {
        ...jobData,
        status: 'open',
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('jobs')
        .insert(jobRow)
        .select();

      if (error) throw error;
      return { data: data[0], error: null };
    } catch (err) {
      console.error("[DbService] Error posting job:", err);
      return { data: null, error: err };
    }
  },

  /**
   * Marks a job completed and updates the provider's trust rating.
   * @param {string} jobId - Errand ID
   * @param {string} providerId - User ID of errand worker/helper
   * @param {number} rating - Star rating value (1-5)
   */
  async completeJob(jobId, providerId, rating) {
    try {
      // 1. Update job status to completed
      const { error: jobErr } = await supabase
        .from('jobs')
        .update({ status: 'completed' })
        .eq('id', jobId)
        .select();
      
      if (jobErr) throw jobErr;

      // 2. Fetch provider's current rating profile to update scores
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', providerId)
        .single();
      
      if (profile) {
        const ratingCount = (profile.rating_count || 0) + 1;
        const ratingSum = (profile.rating_sum || 0) + rating;
        const averageRating = Number((ratingSum / ratingCount).toFixed(1));
        
        await supabase
          .from('profiles')
          .update({
            rating_count: ratingCount,
            rating_sum: ratingSum,
            average_rating: averageRating,
            is_ine_verified: true // Verify automatically as demo helper reward!
          })
          .eq('id', providerId)
          .select();
      }

      return { success: true, error: null };
    } catch (err) {
      console.error("[DbService] Error completing job & rating:", err);
      return { success: false, error: err };
    }
  },

  /**
   * Subscribes to real-time additions/updates on the jobs table.
   * @param {Function} onNewJobCallback - triggers when a new job is added
   */
  subscribeToJobs(onNewJobCallback) {
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'jobs'
        },
        (payload) => {
          if (payload.new && payload.new.status === 'open') {
            onNewJobCallback(payload.new);
          }
        }
      )
      .subscribe();
      
    return channel;
  }
};
