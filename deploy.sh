chmod 600 /tmp/mt_rsa
eval "$(ssh-agent -s)" # Start the ssh agent
ssh-add /tmp/mt_travis
git remote add missilethreat_timeline git@git.wpengine.com:production/missile.git # add remote for production
git fetch --unshallow # fetch all repo history or wpengine complains
git push -f missilethreat_timeline master #deploy to staging site from master branch