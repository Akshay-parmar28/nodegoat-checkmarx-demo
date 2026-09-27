\# NodeGoat Architecture



\## Overview



The application runs locally using Docker Compose with two services:



| Service | Purpose | Container port |

|---|---|---|

| web | NodeGoat web application using Node.js and Express | 4000 |

| mongo | MongoDB database storing application data | 27017 |



The web image is built from the project's Dockerfile.

The database uses the mongo:4.4 image.



\## Architecture diagram



```mermaid

flowchart LR

&#x20;   subgraph HOST\["Windows host"]

&#x20;       B\["Browser - untrusted user input"]

&#x20;       P\["Loopback address - 127.0.0.1:4000"]



&#x20;       subgraph NET\["Docker Compose internal network"]

&#x20;           W\["web container - NodeGoat / Express - port 4000"]

&#x20;           M\[("mongo container - MongoDB 4.4 - port 27017")]

&#x20;       end



&#x20;       B -->|"HTTP requests - trust boundary 1"| P

&#x20;       P -->|"Port forwarding"| W

&#x20;       W -->|"HTTP responses"| B

&#x20;       W -->|"Database operations - trust boundary 2"| M

&#x20;       M -->|"Query results"| W

&#x20;   end

```



\## Data flows



1\. A user opens http://localhost:4000 in their browser.

2\. Docker forwards traffic from host address 127.0.0.1:4000 to port 4000 in the web container.

3\. NodeGoat processes the request.

4\. When database access is needed, NodeGoat connects to mongodb://mongo:27017/nodegoat.

5\. Docker resolves the service name mongo within the Compose network.

6\. MongoDB returns results to NodeGoat.

7\. NodeGoat sends an HTTP response to the browser.



\## Trust boundaries



\### Boundary 1: Browser to application



Browser requests are user-controlled and must be treated as untrusted.

Input validation, authentication and authorisation controls belong at this boundary.



\### Boundary 2: Application to database



The application sends queries and updates to persistent application data.

Safe query construction and appropriate database access controls are required at this boundary.



These are required security controls to assess, not claims that the original application implements them correctly.



\## Network exposure



\- The web port is published as 127.0.0.1:4000:4000.

\- The published web port is restricted to the host loopback address.

\- MongoDB port 27017 is not published to the Windows host.

\- The web service reaches MongoDB through the Compose internal network.

\- There is no direct browser-to-database connection in this architecture.



\## Current setup limitations



\- The local application uses HTTP; this configuration does not provide HTTPS.

\- The Compose startup command invokes artifacts/db-reset.js before starting NodeGoat, so startup can reset sample data.

\- The Compose file does not explicitly configure a named database volume or a host directory for database storage.

\- The original application is intentionally vulnerable; containerisation alone does not fix its application vulnerabilities.



\## Source



This diagram describes our project's Dockerfile and docker-compose.yml.

The original application is OWASP NodeGoat:

https://github.com/OWASP/NodeGoat

