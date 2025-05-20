/**
 * Delbi Restaurant - Deployment Configuration
 */

module.exports = {
  // Production settings
  production: {
    env: 'production',
    nodeVersion: '18.x',
  },
  
  // Deployment checklist
  deploymentChecklist: [
    '✅ Set all environment variables in .env.production',
    '✅ Run npm run lint to check for code issues',
    '✅ Run npm run build to create optimized production build',
    '✅ Verify MongoDB connection string is correct',
    '✅ Verify email configuration is correct',
    '✅ Check image optimization settings',
    '✅ Make sure postbuild script runs for sitemap generation',
  ],
  
  // Instructions for hosting
  hostingInstructions: {
    vercel: [
      '1. Connect GitHub repository to Vercel',
      '2. Configure environment variables in Vercel dashboard',
      '3. Deploy using production branch',
    ],
    customServer: [
      '1. Clone repository on server',
      '2. Install dependencies: npm install --production',
      '3. Create .env.production file with all required variables',
      '4. Build the project: npm run prod:build',
      '5. Start with PM2: pm2 start npm --name "delbi" -- run prod:start',
    ]
  }
}; 