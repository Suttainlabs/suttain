import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const githubUsername = Deno.env.get('GITHUB_USERNAME');
        const githubToken = Deno.env.get('GITHUB_TOKEN');

        if (!githubUsername || !githubToken) {
            return Response.json({ error: 'GitHub credentials not configured' }, { status: 500 });
        }

        const { action } = await req.json();

        if (action === 'create_repo') {
            const repoResponse = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Suttain-App'
                },
                body: JSON.stringify({
                    name: 'suttain-platform-docs',
                    description: 'Documentation and showcase for Suttain - AI-powered chemical safety and formulation platform',
                    private: false,
                    has_issues: true,
                    has_projects: true,
                    has_wiki: true,
                    auto_init: true,
                    gitignore_template: 'Node',
                    license_template: 'mit'
                })
            });

            if (!repoResponse.ok) {
                const errorData = await repoResponse.json();
                throw new Error(`Failed to create repository: ${errorData.message}`);
            }

            const repo = await repoResponse.json();
            return Response.json({ success: true, repo_url: repo.html_url, clone_url: repo.clone_url });
        }

        if (action === 'create_readme') {
            const readmeContent = `# Suttain Platform\n\nAI-powered chemical safety and formulation platform.\n\n**Website**: https://suttain.com\n`;

            const readmeResponse = await fetch(`https://api.github.com/repos/${githubUsername}/suttain-platform-docs/contents/README.md`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Suttain-App'
                },
                body: JSON.stringify({
                    message: 'Add Suttain platform documentation',
                    content: btoa(readmeContent),
                    branch: 'main'
                })
            });

            if (!readmeResponse.ok) {
                const errorData = await readmeResponse.json();
                throw new Error(`Failed to create README: ${errorData.message}`);
            }

            return Response.json({ success: true, message: 'README created successfully' });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('GitHub repo creation error:', error);
        return Response.json({ error: error.message || 'Failed to create GitHub repository' }, { status: 500 });
    }
});