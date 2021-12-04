# Timetrack - Time Tracking Helper

Timetrack is a web application that I created to help automate tracking time when working with multiple clients. This project was built with automation to help input data into the old QuickBooks Pro Timer desktop application. 

Quickbooks Pro Timer is an old application which makes it very cumbersome to input time easily. This application attempts to solve that by providing a more streamlined interface for inputting time and generates automation scripts that you can run on your desktop to automatically input data into the application.

## Tech Stack

This application is built using separate server and client packages. The server is built using Typescript and the client is built using plain Javascript and React. 

**Server Side:**
- Typescript 
- Express
- MariaDB
- TypeORM
- Prometheus

**Client Side:**
- Javascript
- ReactJS
- Material UI
- Formik

## Timetrack Features

### Adding new Time

You can add new time on the homepage, one at a time, or import via CSV using a custom format. 

![Adding new time](/img/input-time.png)

![Bulk import time](/img/bulk-import.png)


### Generating Reports

After all of the desired time is imported, you can create a report. This will summarize all of the time you spent, per customer, per week.

![Generating a report](/img/generate-report.png)

You can edit, view, and merge tracked times for each customer, and view a daily report of times for each week.

![Editing times](/img/edit-time.png)

![Daily report](/img/weekly-review.png)

Finally, you can finalize reports after creating them. This will generate a python file that you can download which will automatically input data into Quickbooks Pro Timer. 

![Finalizing report](/img/final-review.png)

## Installation

You need `docker` and `docker-compose` to install and use Timetrack. This has been tested on Mac OS and Ubuntu. The docker build will work on x86 and ARM64.

```bash
# Build the docker image locally 
./build.sh
```


## Usage

To start the application locally, run:
```bash
docker-compose up -d
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### Local Development

In order to make modifications to the code, you must have node.js installed locally. 

Run the server and client (with live reload). Execute the following commands from the root directory of the project:
```bash
# Start the development DB
docker-compose up -d -f server/docker-compose.yml

# Start the server with live reload
npm run dev:server

# Start the client with live reload
npm run dev:client
```
*Note: Server must be started first.*


## License
[MIT](https://choosealicense.com/licenses/mit/)