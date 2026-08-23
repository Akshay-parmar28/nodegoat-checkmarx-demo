# Setup instructions for group members

### Step 1 - install Node.js, Docker & Git. Node.js runs NodeGoat, Docker is needed to run it in containers (app + MongoDB), Git is for committing and pushing to GitHub (you may have to add your GitHub account credentials to local git if not already added)
---
1. Install [Node.js](https://nodejs.org/) (LTS 24.19.0 version), [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Engine and Compose), and Git.

2. check with `node --version`, `docker --version` and `docker compose version`

3. Install WSL (this is needed for Docker Desktop to work). Run `wsl --install` in cmd.

   Give a username and password when installation asks for it.

   Restart pc after completion.

### step 2 - Downloading NodeGoat project to your PC to work on it. Unlike WebGoat, there's no JAR to build — NodeGoat runs directly from source with Node.js. Docker is only needed to bring up the full app + database together, or to test the final containerised setup before committing.
---

4. open CMD in desktop run this to clone the repo:

    ```git clone https://github.com/Ravindu-orzo/NodeGoat.git```

### step 3 - install dependencies. NodeGoat has no build/JAR step — we just install its npm packages.
---

5. move into the project folder: ```cd NodeGoat```

6. install all dependencies:

    ```npm install```

### step 4 - Making the Docker images and running them with Docker Desktop. Unlike WebGoat (one container, embedded database), NodeGoat's docker-compose brings up TWO containers: the app and a separate MongoDB instance, connected together.

7. open start menu and run Docker Desktop.

    skip adding an account. then let docker engine start

8. build the images:

    ```docker-compose build```

9. run the app:

    ```docker-compose up```

    then go to ```http://localhost:4000``` . see if NodeGoat opens up in the browser

    - Default test accounts (seeded into MongoDB): `admin` / `Admin_123`, `user1` / `User1_123`, `user2` / `User2_123`
    - If the database looks empty (no login works), the seed script may need to be run manually inside the container:
      ```docker-compose exec web node artifacts/db-reset.js```

10. Once you have tested if it works, turn NodeGoat off:

    ```docker-compose down```

### Step 5 - Each group member should make their own branch! do not make any changes to the main branch. make your own branch, commit & push changes to that branch during the vulnerability patching process.
---
11. Open CMD inside the NodeGoat folder and run this to make a branch with your IT number as the name:

     ```git checkout -b ITXXXXXXX```

     this automatically moves you into that branch as well.

     you can always check which branch you are on by running `git branch`

12. push your newly made branch to github (you made the branch in local repo, you now have to update github about it)

    `git push -u origin (your branch name)`

    ex: `git push -u origin IT24103645`

##### Important: unlike WebGoat, there's no build step at all for local testing — you can just run NodeGoat directly with `npm run dev` (auto-restarts on file changes via nodemon) and skip Docker entirely while coding. Only use Docker when you want to test the fully containerised setup or before committing changes that touch Docker config.

### step 6 - Run locally for fast iteration (no Docker needed).
---

13. make sure MongoDB is available. Easiest option: start just the mongo container from the compose file:

    ```docker-compose up mongo```

14. seed the database once (first time only):

    ```npm run db:seed```

15. run the app with auto-restart on changes:

    ```npm run dev```

    this starts NodeGoat at ```http://localhost:5000```

### step 7 - daily workflow
---

```
1. Start Docker Desktop (only mongo container needed for local dev)
   docker-compose up mongo

2. Make sure you're on your own branch
   git checkout ITXXXXXXX

3. Pull/sync if necessary
   git pull

4. Make code changes in your editor --> run with `npm run dev` to test changes live (no build step)

5. When ready to commit, verify the full containerised app still works:
   docker-compose build
   docker-compose up

6. Test NodeGoat
   http://localhost:4000

7. Stop containers
   docker-compose down

8. Commit changes to local repository
   git add .
   git commit -m "..."

9. Sync remote repository (Github) with changes in your local repository
   git push
```

##### EXTRA: Daily workflow git commands explained
1. ready up changed files for saving to local repo : `git add .`
2. save the changed files to local repo : `git commit -m "commit msg eka"`

    ex: `git commit -m "added authentication to login form"`
3. sync local repo with remote repo (github repo) : `git push`

##### EXTRA: Little about Docker (SELF NOTE):
- docker is preferred as it runs applications immediately without having to setup dependencies
- how it does this is package the app & its dependencies together and run that docker image, which spawns a VM-like environment called a docker container.
- Main components of docker ecosystem: Docker file, Docker image, Docker engine, Docker container.
- `docker file` is a script telling how to build a `docker image` by packaging the application & its dependencies together.
- `docker image` contains the final build of the application, its dependencies & info needed to spawn a container, packaged together.
- `docker engine` spawns a `docker container` from this `docker image`.
- app runs comfortably within the container as it has all the dependencies needed.
- NodeGoat's compose setup spawns **two** containers (app + mongo) that talk to each other over Docker's internal network — this is what gives us the "two separate components" the assignment requires, unlike WebGoat's single container with an embedded database.

```
NodeGoat source code (this is what we edit)
       ↓
   npm install (fetches dependencies — no build step)
       ↓
   Dockerfile(s) + docker-compose.yml
       ↓
   Docker images (app image + official mongo image)
       ↓
   Two Docker containers (app <--> mongo), networked together
       ↓
   NodeGoat running at localhost:4000
```
