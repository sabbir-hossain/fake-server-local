import {
  ExpressErrorMiddlewareInterface,
  Middleware,
} from "routing-controllers";

@Middleware({ type: "after" })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, req: any, res: any, next: (err?: any) => any): void {
    console.error("Error caught by middleware:", error);

    if (res.headersSent) {
      return next(error); // let Express handle if already sent
    }

    res.status(error.httpCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}
