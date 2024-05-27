docker build -t pw-manager-back .
docker tag pw-manager-back us-central1-docker.pkg.dev/pw-manager-424216/main/pw-manager-back
docker push us-central1-docker.pkg.dev/pw-manager-424216/main/pw-manager-back
gcloud run deploy \
    --image us-central1-docker.pkg.dev/pw-manager-424216/main/pw-manager-back \
    --port 5050 \
    --add-cloudsql-instances pw-manager-424216:us-central1:pw-manager-db \
    --allow-unauthenticated \
    pw-manager-backend