import React from 'react';
import './NotFound.css';

const NotFound = () => {
  return (
    <>
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css?family=Cabin:400,700"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Montserrat:900"
          rel="stylesheet"
        />
        <link type="text/css" rel="stylesheet" href="css/style.css" />
        {process.env.NODE_ENV === 'development' && (
          <>
            <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js" />
            <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js" />
          </>
        )}
      </head>

      <body>
        <div id="notfound">
          <div className="notfound">
            <div className="notfound-404">
              <h3>Oops! Page not found</h3>
              <h1>
                <span>4</span>
                <span>0</span>
                <span>4</span>
              </h1>
            </div>
            <h2>we are sorry, but the page you requested was not found</h2>
          </div>
        </div>
      </body>
    </>
  );
};

export default NotFound;
