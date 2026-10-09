# SplitSimple

A simple bill-splitting web app. Enter an amount and the people involved, get each person's share, save groups of friends, and keep a history of past splits. Data syncs to a small serverless backend on AWS.

Built with plain HTML, CSS and JavaScript. No framework and no build step.

## Features

- Equal bill splitting between any number of people
- Accounts: register and log in
- Saved groups of people for quick reuse
- Split history with a paid / unpaid status for each person
- Admin dashboard
- Cloud sync: your groups and history are stored in AWS (DynamoDB) and restored when you log in on another browser or device

## Project structure

```
SplitSimple/
├── html-main/        The working app (open index.html)
│   ├── index.html
│   ├── script.js     App logic + AWS cloud sync
│   └── style.css
├── html/ and css/    Early multi-page UI prototype (not wired up, kept for reference)
└── README.md
```

## Run locally

There is nothing to install. Any static file server works.

Option 1: open `html-main/index.html` in your browser.
Option 2 (recommended): use the VS Code **Live Preview** extension, or from the repo folder run:

```
npx serve
```

then open `http://localhost:3000/html-main/`.

## How the AWS backend works

```
Browser app  ->  API Gateway (HTTP API)  ->  Lambda  ->  DynamoDB
                                              |
                                          CloudWatch (logs and metrics)
```

| Service | Role |
|---|---|
| **S3** | Optional static hosting for the frontend |
| **API Gateway** | HTTP API with a single route, `ANY /items`, that invokes the Lambda function |
| **Lambda** | Node.js function `SplitSimpleApi` handling GET, POST and DELETE |
| **DynamoDB** | Table `SplitSimpleData` (partition key `userId`, sort key `itemId`, on-demand capacity) |
| **CloudWatch** | Lambda logs and metrics |

### Data model

Each user has two items in the table:

| userId | itemId | data |
|---|---|---|
| `<username>` | `Groups` | list of saved groups |
| `<username>` | `History` | list of saved splits |

### API

| Method | Request | Effect |
|---|---|---|
| `GET` | `/items?userId=<name>` | Returns all items for that user |
| `POST` | `/items` with JSON body `{ userId, itemId, type, data }` | Saves one item |
| `DELETE` | `/items?userId=<name>&itemId=<Groups or History>` | Deletes one item |

### How the frontend uses it

`script.js` keeps `localStorage` as a fast local cache and treats DynamoDB as the permanent copy (write-through):

- `cloudSave` runs on every save
- `cloudDelete` runs when history is cleared
- `syncFromCloud` runs on page load, login and registration, and replaces the local cache with the cloud copy. On a first login it uploads any existing local data instead.

Guests (not logged in) stay local-only. If the API is unreachable, the app keeps working from `localStorage`.

## Deploying your own backend

1. **DynamoDB:** create table `SplitSimpleData` with partition key `userId` (String) and sort key `itemId` (String), on-demand.
2. **Lambda:** create a Node.js function with an execution role that can read and write that table, and add the handler code. It must return CORS headers and answer `OPTIONS`.
3. **API Gateway:** create an HTTP API, add the Lambda integration, route `ANY /items`, stage `$default` with auto-deploy.
4. **Frontend:** set `API_URL` near the top of `html-main/script.js` to your API's invoke URL plus `/items`.
5. **Hosting (optional):** upload the three files in `html-main/` to an S3 bucket with static website hosting and a public-read bucket policy, or deploy the repo on Vercel with **Root Directory** set to `html-main` and **Framework Preset** set to **Other**.

## Known limitations

This project was built as an AWS case study and has some honest gaps:

- **Authentication is not secure.** Accounts and passwords are stored in plain text in the browser's `localStorage`, and the admin check is just the username `admin`. Do not use real passwords.
- **The API has no authorization.** Anyone who knows a username can read or write that user's data through the API.
- **The admin dashboard only sees users stored in the current browser.**
- The backend was built in an AWS Academy Learner Lab account, which is temporary. When the course ends, the AWS resources disappear and cloud sync stops. The app then continues to work locally.

## Roadmap

- Replace the homemade login with Amazon Cognito and protect the API with a Cognito authorizer
- Use Cognito groups for admin access
- Serve the site over HTTPS with CloudFront
- Store one DynamoDB item per split instead of one list per user
- Infrastructure as code (AWS SAM or CDK) so the backend can be recreated with one command

## Tech

HTML, CSS, JavaScript, AWS Lambda, Amazon API Gateway, Amazon DynamoDB, Amazon S3, Amazon CloudWatch
