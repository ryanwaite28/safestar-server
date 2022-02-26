**SafeStar**

App for stopping/reporting domestic violence, kidnapping. Community support/check-in app.



The main features of the app:

* Pulse: This is the equivalent of an amber alert. A pulse is an event a user emits that lets other users know their current status. A pulse contains a pulse code which indicates their status, coordinates of where the user is when emitting the pulse, the date and time, etc.
* Tracking: Similar to iPhone's Find My Friends, users can track one another's location to make sure they are safe and where they supposed to be.
* Checkpoint: This is simple ping to another user to check in on them. That user can respond (pong) to let the user know they are okay.
* Coversation: GroupChat equivalent
* Watch: Similar to a conversation with the added feature of assigning a location to it.


This repository is the backend services where the main application logic is. App is deployed on and using Heroku.

The 3rd-party services used:

* PostgreSQL for database
* Cloudinary for Image storage
* Nexmo for SMS texting
* Mail Jet for emails:
* Google Maps API
* AWS S3 for file/object storage

You can use your own credentials. If you don't have your own, you can use the DEV server where it has all the needed env variables set: [https://rmw-safestar-server-dev.herokuapp.com/]()


The Front End (Angular) - [https://github.com/ryanwaite28/safestar-client]()

The Mobile App (Expo React Native) - [https://github.com/ryanwaite28/safestar-mobile]()


I want this app to be developed and maintained by anyone and everyone interested, essentially a community effort.


The Enviroment Variables Needed (these go into a .env file in the project root):


APP_NAME=SafeStar

APP_SECRET=

CRYPT_SALT=

DATABASE_URL_DEV=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_URL=

NEXMO_API_KEY=

NEXMO_API_SECRET=

NEXMO_APP_NUMBER=

MAILJET_API_KEY=

MAILJET_API_SECRET=

MAILJET_CLIENT_EMAIL=ryanwaite28@gmail.com

MAILJET_CLIENT_NAME=SafeStar

JWT_SECRET=

RAPID_API_KEY=

GOOGLE_MAPS_API_KEY=

AWS_ACCESS_KEY_ID=

AWS_SECRET_ACCESS_KEY=
