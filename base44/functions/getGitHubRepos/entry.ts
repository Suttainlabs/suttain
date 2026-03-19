import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response('Unauthorized', { status: 401 });
        }
        
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);
        
        const user = await base44.auth.me();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        const githubUsername = Deno.env.get('GITHUB_USERNAME');
        const githubToken = Deno.env.get('GITHUB_TOKEN');

        if (!githubUsername || !githubToken) {
            return new Response(JSON.stringify({ 
                error: 'GitHub credentials not configured' 
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Fetch user's repositories from GitHub
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

        // Filter and format the repositories
        const formattedRepos = repos
            .filter(repo => !repo.fork) // Exclude forked repositories
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
            .slice(0, 8); // Limit to 8 repositories

        return new Response(JSON.stringify({
            username: githubUsername,
            repositories: formattedRepos
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('GitHub integration error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to fetch GitHub data' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});