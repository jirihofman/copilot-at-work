# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it by sending an email to the repository owner. Please do not create a public GitHub issue for security vulnerabilities.

When reporting, please include:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested fixes (if available)

We will respond to your report within 48 hours and work with you to address the issue.

## Security Best Practices

### Environment Variables

This application uses several sensitive environment variables that must be kept secure:

- **GITHUB_TOKEN**: Personal access token for GitHub API - never commit this to source control
- **UPSTASH_REDIS_REST_URL**: Redis connection URL - keep private
- **UPSTASH_REDIS_REST_TOKEN**: Redis authentication token - keep private
- **CRON_SECRET**: Secret for authenticating cron job requests - use a strong random value

### Important Security Considerations

1. **Never use `NEXT_PUBLIC_` prefix for secrets**: Environment variables prefixed with `NEXT_PUBLIC_` are embedded in the client-side JavaScript bundle and are visible to anyone. Only use this prefix for non-sensitive configuration values.

2. **Cron endpoint security**: The `/api/cron` endpoint is protected by the `CRON_SECRET` environment variable. Only Vercel's cron service should have access to this secret.

3. **Rate limiting**: The `/api/cron` endpoint has rate limiting implemented (10 requests per hour per IP) using Upstash Rate Limiter to protect against abuse.

4. **Git history**: Never commit `.env`, `.env.local`, or any files containing secrets. These files are already listed in `.gitignore`.

5. **Token permissions**: When creating a GitHub Personal Access Token, only grant the minimum required permissions. For this application, only `public_repo` read access is needed.

### Secure Deployment Checklist

Before deploying or making the repository public:

- [ ] Verify all secrets are stored in environment variables, not in code
- [ ] Confirm `.gitignore` includes all environment files
- [ ] Ensure no secrets are present in git history
- [ ] Review all `NEXT_PUBLIC_` variables to ensure they contain no sensitive data
- [ ] Set strong random values for `CRON_SECRET`
- [ ] Configure environment variables in your deployment platform (e.g., Vercel)
- [ ] Verify cron endpoint is protected and not publicly accessible without authentication

## Additional Resources

- [Next.js Environment Variables Documentation](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables Best Practices](https://vercel.com/docs/concepts/projects/environment-variables)
- [GitHub Token Security](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github)
