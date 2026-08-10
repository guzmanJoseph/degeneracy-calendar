import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  /* =========================================
     CORS PREFLIGHT
  ========================================= */

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    const authHeader =
      req.headers.get('Authorization');

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    /* =========================================
       VERIFY USER
    ========================================= */

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    /* =========================================
       ADMIN CLIENT
    ========================================= */

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get(
        'SUPABASE_SERVICE_ROLE_KEY'
      )!
    );

    const userId = user.id;

    /* =========================================
       DELETE POKER SESSIONS

       session_photos cascade automatically.
    ========================================= */

    const {
      error: sessionsError,
    } = await admin
      .from('poker_sessions')
      .delete()
      .eq('user_id', userId);

    if (sessionsError) {
      throw sessionsError;
    }

    /* =========================================
       DELETE PAYOUT GAMES

       poker_game_players cascade automatically.
    ========================================= */

    const {
      error: gamesError,
    } = await admin
      .from('poker_games')
      .delete()
      .eq('created_by', userId);

    if (gamesError) {
      throw gamesError;
    }

    /* =========================================
       REMOVE GROUP MEMBERSHIPS
    ========================================= */

    const {
      error: membershipError,
    } = await admin
      .from('group_members')
      .delete()
      .eq('user_id', userId);

    if (membershipError) {
      throw membershipError;
    }

    /* =========================================
       DELETE GROUPS OWNED BY USER
    ========================================= */

    const {
      error: groupsError,
    } = await admin
      .from('groups')
      .delete()
      .eq('owner_id', userId);

    if (groupsError) {
      throw groupsError;
    }

    /* =========================================
       DELETE PROFILE
    ========================================= */

    const {
      error: profileError,
    } = await admin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      throw profileError;
    }

    /* =========================================
       DELETE AUTH USER LAST
    ========================================= */

    const {
      error: authDeleteError,
    } =
      await admin.auth.admin.deleteUser(
        userId
      );

    if (authDeleteError) {
      throw authDeleteError;
    }

    /* =========================================
       SUCCESS
    ========================================= */

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error(
      'Delete account function error:',
      error
    );

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'Account deletion failed',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});