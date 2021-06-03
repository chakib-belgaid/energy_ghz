#!/bin/sh

# build frontend
cd web/ui
# npm install && npm run build 

npm run-script build  --cashed

# back up
cd ../../

# build statik bundle
statik -f -src=web/ui/dist -dest=web/router
