// This endpoint is deprecated and can not be used
// 16.8.2020

// const { log, sendEmailVerification } = require('../../lib');
// const { User } = require('../../models');

// const schema = {
//   description: 'Completes Users registration. Requires authorization',
//   summary: 'Complete registration process',
//   tags: ['User'],
//   body: {
//     type: 'object',
//     required: ['username', 'password', 'email'],
//     properties: {
//       username: {
//         type: 'string',
//         minLenght: 3,
//       },
//       firstName: {
//         type: 'string',
//       },
//       surname: {
//         type: 'string',
//       },
//       age: {
//         type: 'number',
//       },
//       guild: {
//         type: 'string',
//       },
//       university: {
//         type: 'string',
//       },
//       email: {
//         type: 'string',
//         format: 'email',
//       },
//       password: {
//         type: 'string',
//         minLength: 8,
//       },
//     },
//   },
//   response: {
//     200: {
//       type: 'object',
//       properties: {
//         status: {
//           type: 'string',
//         },
//         accessToken: {
//           type: 'string',
//         },
//         refreshToken: {
//           type: 'string',
//         },
//       },
//     },
//   },
// };

// const handler = async (req, reply) => {
//   const payload = req.body;

//   payload.roles = ['player', 'unConfirmedEmail'];
//   payload.registrationComplete = true;

//   let user;
//   try {
//     user = await User.findOneAndUpdate({
//       _id: req.auth.jwtPayload._id,
//       registrationComplete: false,
//     },
//     payload,
//     {
//       runValidators: true,
//     });
//   } catch (error) {
//     log.error('Error when trying to update user! ', error);
//     reply.status(500).send({
//       status: 'ERROR',
//       error: 'Internal Server Error',
//     });
//     return;
//   }

//   if (!user) {
//     reply.status(404).send({
//       status: 'ERROR',
//       error: 'Not Found',
//       message: 'User not found.',
//     });
//     return;
//   }

//   // Generate new token with correct roles
//   let accessToken;
//   let refreshToken;
//   try {
//     accessToken = await reply.jwtSign({
//       _id: user._id,
//       roles: user.roles,
//       steamID64: user.steam.steamID64,
//     }, {
//       expiresIn: '10min',
//     });
//     refreshToken = await reply.jwtSign({
//       _id: user._id,
//     }, {
//       expiresIn: '2d',
//     });
//   } catch (error) {
//     log.error('Error creating token!', error);
//   }

//   // Send verification email
//   try {
//     await sendEmailVerification(user, reply);
//   } catch (error) {
//     log.error('Error sending an email! ', error);
//     reply.status(500).send({
//       status: 'ERROR',
//       error: 'Internal Server Error',
//     });
//     return;
//   }

//   reply.send({
//     status: 'OK',
//     accessToken,
//     refreshToken,
//   });
// };

// module.exports = async function (fastify) {
//   fastify.route({
//     method: 'POST',
//     url: '/register/complete',
//     preValidation: fastify.auth([fastify.verifyJWT]),
//     handler,
//     schema,
//   });
// };
