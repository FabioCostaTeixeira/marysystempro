import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, aluno_id } = await req.json();

    if (!email || !aluno_id) {
      throw new Error("E-mail e ID do aluno são obrigatórios.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Convida o usuário usando o e-mail fornecido. O Supabase cuidará do envio do e-mail de convite.
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    if (userError) throw userError;
    
    const newUser = userData.user;
    if (!newUser) throw new Error("Falha ao convidar o usuário.");

    const { error: updateError } = await supabaseAdmin
      .from('alunos')
      .update({ user_id: newUser.id })
      .eq('id', aluno_id);

    if (updateError) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.id);
      throw updateError;
    }

    return new Response(JSON.stringify({ message: `Convite enviado com sucesso para ${email}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});