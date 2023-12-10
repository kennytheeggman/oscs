echo -e "\033[32mBuilding src/main.py in docker\033[0m"
uuid=$(uuidgen)
docker build -t $uuid .
echo -e "\033[32mRunning docker container $uuid\033[0m\n"
docker run --name $uuid -i -p 5000:5000 $uuid

echo -e "\n\033[32mStopping docker conainer $uuid\033[0m"
docker stop $uuid > .tmp
docker remove $uuid > .tmp
docker rmi $uuid > .tmp
echo -e "\033[32mStopped docker conainer $uuid\033[0m"

rm .tmp
