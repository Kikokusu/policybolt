import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!, 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { installation_id, project_id } = await req.json()
    
    console.log('Received:', { installation_id, project_id })

    // Test database connection first
    console.log('Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('github_installations')
      .select('count(*)')
      .limit(1)

    console.log('DB test result:', { testData, testError })

    if (testError) {
      throw new Error(`Database connection failed: ${testError.message}`)
    }

    // Simple insert without upsert first
    console.log('Inserting installation...')
    const { data: installationRecord, error: installationError } = await supabase
      .from('github_installations')
      .insert({
        installation_id: parseInt(installation_id),
        account_id: 0,
        account_login: 'test_user',
        account_type: 'User',
        status: 'active'
      })
      .select()
      .single()

    console.log('Installation result:', { installationRecord, installationError })

    if (installationError) {
      throw new Error(`Installation insert failed: ${installationError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Installation created successfully',
        installation: installationRecord
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})