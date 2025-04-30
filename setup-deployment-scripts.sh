#!/bin/bash
# Setup deployment scripts by making them executable

# Make all deployment scripts executable
chmod +x deploy-railway.sh
chmod +x validate-env.sh
chmod +x collect-logs.sh
chmod +x test-collaborative-features.js

echo "✅ All deployment scripts are now executable"
echo ""
echo "Deployment scripts available:"
echo "- deploy-railway.sh: Deploy both services to Railway"
echo "- validate-env.sh: Validate environment variables"
echo "- collect-logs.sh: Collect logs for troubleshooting"
echo "- test-collaborative-features.js: Test collaborative features"
echo ""
echo "To deploy to Railway:"
echo "1. Make sure Railway CLI is installed: npm i -g @railway/cli"
echo "2. Login to Railway: railway login"
echo "3. Run deployment script: ./deploy-railway.sh"
