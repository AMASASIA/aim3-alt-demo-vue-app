@echo off
echo === [1/3] Git Sync ===
call npm install --legacy-peer-deps
call git add .
call git commit -m "feat: fullstack unified deployment on Vercel"
call git push origin main
echo === [2/3] Deploying to Vercel ===
call vercel --prod --yes
echo === [3/3] Done ===
pause
