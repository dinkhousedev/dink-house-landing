#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');

const sessionId = process.argv[2];

if (!sessionId) {
  console.error('Usage: node complete-by-session.js <checkout_session_id>');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function completeBySession() {
  try {
    console.log(`Completing contribution with session ID: ${sessionId}\n`);

    const { data, error } = await supabase.rpc('complete_contribution_by_session', {
      p_session_id: sessionId
    });

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Result:', JSON.stringify(data, null, 2));
      if (data?.success) {
        console.log(`\n✓ Contribution ${data.contribution_id} completed successfully!`);
        console.log('\nRefresh your campaign page to see the updated counts.');
      }
    }
  } catch (error) {
    console.error('Script error:', error);
  }
}

completeBySession();
