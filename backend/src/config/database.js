const { createClient } = require('@supabase/supabase-js');

const connectDB = async () => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test the connection by making a simple query
    const { data, error } = await supabase
      .from('poets')
      .select('id')
      .limit(1);
    
    if (error) {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }
    
    console.log(`✅ Supabase Connected: ${supabaseUrl}`);
    console.log(`📊 Database accessible: ${data ? 'Yes' : 'No'}`);
    
    // Make supabase available globally
    global.supabase = supabase;
    
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error.message);
    process.exit(1);
    return;
  }
};

module.exports = connectDB;
