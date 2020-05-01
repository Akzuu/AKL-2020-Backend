# AKL 2020 Web Backend

Simple Node.js backend for Akateeminen Kynäriliiga. Created and currently maintained by Akseli Kolari, TG: akzu404.

## How to run in local env?
First, you must make sure that you are running MongoDB server. Then, create file a called **local.js** to *./config/* . Copy and paste config-example.js contents to local.js and fill in the necessary parts.

After that, open terminal (in the AKL-2020-Backend folder) and type in the following
```
npm i   // Install all the necessary components
npm run service   // Run the service
```

## Endpoint documentation
You can find swagger from the url */documentation/*. E.g. if running in local env and port 3000, *localhost:3000/documentation*

## How authentication works
Authentication is stateless and it is done with JWT tokens. We have two tokens, accessToken and refreshToken. AccessToken expires in 10 minutes, because it also stores roles which can change pretty fast. RefreshTokens expire in 2 days.

If accessToken has expired, but refreshToken is still valid, the endpoint will supply the response with new tokens. Both refresh and access will be generated again.

If refreshToken has expired, user must login again to get new tokens. If expired token has been used, the server will respond with 401 Unauthorized.

Frontend must be able to process new tokens from every endpoint, because new tokens may arrive from every endpoint that checks authentication. It should also check if the accessToken has expired, because it must then use refreshToken.

## Roles
Currently, there are five roles. Roles are stored to array in user model, so it should be easy to create more roles if needed. This of course has some drawbacks, but it is imo better than the alternative.

#### Unregistered
User has completed Steam login and data from Steam has been saved to database. User must complete registration using correct endpoint to gain normal access. Frontend should forward users to correct endpoint for completing registration process.

#### Player
Basic role given to everyone who completes registration.

#### Moderator
Can modify website (use text endpoints for posting news etc).

#### Admin
Basic admin role, can remove users and see more info about them etc.

#### PasswordReset
User has started password reset procedure, for example in case of forgotten password.

## TODO
-Resend email confirmation when user changes email