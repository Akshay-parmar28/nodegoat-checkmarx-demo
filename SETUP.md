\# NodeGoat Local Setup



\## Requirements



\- Git

\- Docker Desktop, running with Linux containers

\- Internet access for the initial image and dependency downloads



\## Download the project



```powershell

git clone https://github.com/Thakshila05/NodeGoat.git

cd NodeGoat

git switch member1/docker-setup

```



The setup changes are currently on the member1/docker-setup branch.



\## Build and start



Run from the folder containing docker-compose.yml:



```powershell

docker compose up --build -d

```



This builds the NodeGoat application image and starts the web and MongoDB services in the background.



\## Check the services



```powershell

docker compose ps

```



Both services should show an Up status.



The web service should display:



```text

127.0.0.1:4000->4000/tcp

```



\## Open the application



Open http://localhost:4000 in a browser.



Use only sample data and training accounts in this application.



\## View recent logs



```powershell

docker compose logs --tail=50

```



\## Stop the application



```powershell

docker compose stop

```



This stops the containers without removing them.



\## Start the application again



```powershell

docker compose up -d

```



The existing startup command runs a database-reset script, so restarting the web service can reset sample data.



\## Architecture



\- web: NodeGoat application built from the project Dockerfile.

\- mongo: MongoDB service using the mongo:4.4 image.

\- NodeGoat connects to mongodb://mongo:27017/nodegoat through the Compose network.

\- The application is published on the host loopback address at port 4000.

\- MongoDB port 27017 is not published to the host.



\## Original baseline



Starting commit recorded before our changes:



c5cb68a7084e4ae7dcc60e6a98768720a81841e8



Original project: https://github.com/OWASP/NodeGoat



\## Troubleshooting



\- If Docker cannot connect to its engine, open Docker Desktop and wait for it to start.

\- If the browser cannot connect, check docker compose ps and the recent logs.

\- An obsolete version-field warning does not by itself mean startup failed.

