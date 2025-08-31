import { Controller, Get, Res } from "routing-controllers";
import { Response } from "express";

@Controller('/dashboard')
export class ViewController {
  private port: number;

  constructor() {
    this.port = Number(process.env.PORT) || 3000;
  }

  @Get("/")
  renderHome(@Res() res: Response): any {
    console.log(`Rendering home with port: ${this.port}`);
    res.render("layout", { projectUrl: `http://localhost:${this.port}` });

    return res;
  }
}
