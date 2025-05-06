# Flatirons Development Back-end Rails/NodeJS Developer Coding Test

Be sure to read **all** of this document carefully, and follow the guidelines within.

## Context

Use Ruby On Rails or NestJS to implement a web application that can upload, process, and store into a database a CSV file containing a list of products.

[CSV File](https://github.com/flatironsdevelopment/rails_node_test/raw/main/data.csv)


## Requirements

1. The products should be stored along with multiple exchange rates at the time of the upload utilizing this [API](https://github.com/fawazahmed0/exchange-api) (include at least 5 currencies). All product fields are required and must be present.
2. Implement an endpoint that returns all the processed rows of product data along with the available currency conversions stored at the time of the upload. This endpoint should support filtering and sorting based on the name, price, and expiration fields
4. The application should support CSV files with up to 200k rows.
5. The front-end should be a React application that displays a file upload input. While the file is uploading and being processed, there should be a loading indicator displayed. Once the file uploads, a success message should display. 

## Submission

> Where should I send back the result when I'm done?

Create a branch and send a Pull Request into main when you are done. 
There is no deadline for this task unless otherwise noted to you directly.
In the pull request, please include a video walk-through (roughly 2-3 minutes) of your code and the experience you built. Also, describe improvement opportunities.

[Vidyard](https://www.vidyard.com/chrome-extension-screen-recording/?utm_source=google-ads&utm_medium=cpc&utm_campaign=ChromeExtensionScreenRecord&utm_content=Extention_ChromeExt&utm_term=computer%20screen%20recorder%20free_b&gclid=Cj0KCQiA0eOPBhCGARIsAFIwTs4sn5e2WT7CGOsil0csKejSIthegolcNF2hVsixwJIOXI1zKWW8eO4aAgoVEALw_wcB) is a good choice.

## Questions

If you have any questions, just create a new issue in this repo and we will respond and get back to you quickly.

This will start the NestJS application in development mode.

## Docker Setup Database

To run the application with Docker, ensure you have Docker and Docker Compose installed. Then, you can start the services using:
```
cd reader-backend/
docker-compose up
```

## Usage

To run the application locally, use the following command:
```
cd reader-backend/
npm run start:dev
```

## Running the Frontend

To run the `reader-frontend` application locally, follow these steps:

1. Navigate to the `reader-frontend` directory:
    ```bash
    cd reader-frontend/
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Start the React application:
    ```bash
    npm start
    ```

This will start the React application in development mode. You can access it in your browser at `http://localhost:3000`.

Make sure the backend is running before starting the frontend to ensure proper communication between the two applications.