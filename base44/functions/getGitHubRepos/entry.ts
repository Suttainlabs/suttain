import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const githubUsername = Deno.env.get('GITHUB_USERNAME');
        const githubToken = Deno.env.get('GITHUB_TOKEN');

        if (!githubUsername || !githubToken) {
            return Response.json({ error: 'GitHub credentials not configured' }, { status: 500 });
        }

        const reposResponse = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=10`, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Suttain-App'
            }
        });

        if (!reposResponse.ok) {
            throw new Error(`GitHub API error: ${reposResponse.status}`);
        }

        const repos = await reposResponse.json();

        const formattedRepos = repos
            .filter(repo => !repo.fork)
            .map(repo => ({
                id: repo.id,
                name: repo.name,
                description: repo.description,
                html_url: repo.html_url,
                language: repo.language,
                stargazers_count: repo.stargazers_count,
                forks_count: repo.forks_count,
                updated_at: repo.updated_at,
                topics: repo.topics || [],
                private: repo.private
            }))
            .slice(0, 8);

        return Response.json({ username: githubUsername, repositories: formattedRepos });

    } catch (error) {
        console.error('GitHub integration error:', error);
        return Response.json({ error: 'Failed to fetch GitHub data' }, { status: 500 });
    }
});