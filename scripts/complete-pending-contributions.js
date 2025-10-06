#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function completePendingContributions() {
  try {
    // Get all pending contributions using RPC
    const { data: contributions, error: fetchError} = await supabase
      .rpc('get_pending_contributions');

    if (fetchError) {
      console.error('Error fetching contributions:', fetchError);
      return;
    }

    console.log(`Found ${contributions?.length || 0} pending contributions with checkout sessions`);

    if (contributions && contributions.length > 0) {
      console.log('\nPending contributions:');
      contributions.forEach(c => {
        console.log(`  - ${c.backer_email}: $${c.amount} (${c.stripe_checkout_session_id})`);
      });
      console.log('');
    }

    for (const contribution of contributions || []) {
      console.log(`Completing contribution ${contribution.id}...`);

      const { error: updateError } = await supabase.rpc('complete_contribution', {
        p_contribution_id: contribution.id,
        p_payment_intent_id: contribution.stripe_payment_intent_id || 'manual_completion',
        p_checkout_session_id: contribution.stripe_checkout_session_id,
        p_payment_method: 'card'
      });

      if (updateError) {
        console.error(`Error completing contribution ${contribution.id}:`, updateError);
      } else {
        console.log(`✓ Completed contribution ${contribution.id}`);
      }
    }

    console.log('\nDone!');
  } catch (error) {
    console.error('Script error:', error);
  }
}

completePendingContributions();
