// Data returned from layout load functions is available to child +layout.svelte components
// and the +page.svelte component as well as the layout that it ‘belongs’ to.
export const load = async ({ locals }) => {
	const {
		data: { session },
		error: sessionError
	} = await locals.supabase.auth.getSession();
	if (sessionError) throw sessionError;
	if (!session) return {};

	const {
		data: { user },
		error: userError
	} = await locals.supabase.auth.getUser();
	if (userError) throw userError;

	const battletag = user?.user_metadata.battletag;
	return {
		username: typeof battletag === 'string' ? battletag.split('#')[0] : undefined
	};
};
