"use strict";
// // src/middleware/errorHandler.ts
// import { Context, Next } from 'koa';
// export const errorHandler = async (ctx: Context, next: Next) => {
//   try {
//     await next();
//   } catch (err: any) {
//     console.error('Error occurred:', err);
//     // Check if the error is from routing-controllers
//     if (err.httpCode) {
//       ctx.status = err.httpCode;
//       ctx.body = {
//         message: err.message || 'Error',
//       };
//     } else {
//       ctx.status = err.status || 500;
//       ctx.body = {
//         message: err.message || 'Internal Server Error',
//       };
//     }
//     ctx.app.emit('error', err, ctx);
//   }
// };
