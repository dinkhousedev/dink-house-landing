const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testContributionEmail() {
  console.log('🔍 Checking for recent contributions...\n');

  // Get the most recent completed contribution
  const { data: contributions, error: contribError } = await supabase
    .from('contributions')
    .select('*')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1);

  if (contribError) {
    console.error('❌ Error fetching contributions:', contribError);
    return;
  }

  if (!contributions || contributions.length === 0) {
    console.log('⚠️  No completed contributions found');
    return;
  }

  const contribution = contributions[0];
  console.log('✅ Found contribution:', {
    id: contribution.id,
    amount: contribution.amount,
    status: contribution.status,
    completed_at: contribution.completed_at
  });

  console.log('\n📧 Calling send_contribution_thank_you_email RPC...\n');

  // Call the email function
  const { data: emailResult, error: emailError } = await supabase
    .rpc('send_contribution_thank_you_email', {
      p_contribution_id: contribution.id
    });

  if (emailError) {
    console.error('❌ Error calling email function:', emailError);
    return;
  }

  console.log('📨 Email function response:', JSON.stringify(emailResult, null, 2));

  if (emailResult?.success) {
    console.log('\n✅ Email queued successfully!');
    console.log('📬 Recipient:', emailResult.recipient);
    console.log('📝 Email Log ID:', emailResult.email_log_id);
    console.log('\n📊 Email Data Preview:');
    console.log('  First Name:', emailResult.email_data.first_name);
    console.log('  Amount:', emailResult.email_data.amount);
    console.log('  Tier:', emailResult.email_data.tier_name);
    console.log('  Benefits HTML length:', emailResult.email_data.benefits_html?.length || 0);

    // Now try to send via SendGrid function
    console.log('\n📮 Sending email via SendGrid Edge Function...\n');

    const emailData = emailResult.email_data;

    const { data: sendResult, error: sendError } = await supabase.functions.invoke(
      'send-email-sendgrid',
      {
        body: {
          to: emailResult.recipient,
          subject: 'Thank You for Your Contribution to The Dink House! 🎉',
          html: `<h1>Test Email - Would contain full HTML here</h1><p>First Name: ${emailData.first_name}</p><p>Amount: $${emailData.amount}</p>`,
          text: `Test Email\n\nFirst Name: ${emailData.first_name}\nAmount: $${emailData.amount}`
        }
      }
    );

    if (sendError) {
      console.error('❌ SendGrid function error:', sendError);
    } else {
      console.log('✅ SendGrid function response:', sendResult);
    }

  } else {
    console.error('❌ Email preparation failed:', emailResult?.error);
  }

  console.log('\n🔍 Checking email_logs table...\n');

  const { data: emailLogs, error: logsError } = await supabase
    .from('email_logs')
    .select('*')
    .eq('template_key', 'contribution_thank_you')
    .order('created_at', { ascending: false })
    .limit(3);

  if (logsError) {
    console.error('❌ Error fetching email logs:', logsError);
  } else {
    console.log('📋 Recent email logs:');
    emailLogs.forEach((log, i) => {
      console.log(`\n  ${i + 1}. Email Log:`);
      console.log(`     To: ${log.to_email}`);
      console.log(`     Status: ${log.status}`);
      console.log(`     Created: ${log.created_at}`);
      console.log(`     Error: ${log.error_message || 'None'}`);
    });
  }
}

testContributionEmail()
  .then(() => {
    console.log('\n✅ Test complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  });
