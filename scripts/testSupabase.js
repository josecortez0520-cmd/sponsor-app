(async function(){
  try {
    const sb = require('../lib/supabase');
    const state = await sb.getState();
    const sponsors = Array.isArray(state.sponsors) ? state.sponsors.length : 0;
    const hasProfile = !!state.profile;
    console.log('CONNECTED: app_state read. sponsors_count=' + sponsors + ', hasProfile=' + hasProfile);
  } catch (e) {
    console.error('ERROR:', e && e.message ? e.message : e);
    process.exit(2);
  }
})();
