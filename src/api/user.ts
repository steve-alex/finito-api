import { Router, Request, Response, NextFunction } from 'express';
import User from '../models/user';
import Controller from '../interface/Controller.interface';
import auth from '../middleware/auth';
import UserService from '../services/user.service';
import RequestDTO from '../interface/RequestDTO.interface';

class UserController implements Controller {
  public path = '/users';
  public router = Router();
  public userService = new UserService();

  constructor(){
    this.initializeRoutes();
  }

  public initializeRoutes(){
    this.router.post(`${this.path}/login`, this.loginUser);
    this.router.post(`${this.path}/logout`, auth, this.logoutUser);
    this.router.get(`${this.path}/navigation`, auth, this.getNavigationItems);
    this.router.post(this.path, this.createUser);
    this.router.get(`${this.path}/:id`, auth, this.getUserById);
    this.router.patch(`${this.path}/:id`, auth, this.updateUser);
    this.router.delete(`${this.path}/:id`, auth, this.deleteUser);
  }

  loginUser = async (request: RequestDTO, response: Response, next: NextFunction) => {
    try {
      const { user, token } = await this.userService.authenticateUserCredentials(request.body.email, request.body.password);
      response.status(200).send({ user, token });
    } catch (error) {
      next(error);
    }
  }

  logoutUser = async(request: RequestDTO, response: Response, next: NextFunction) => {
    try {
      await this.userService.refreshCurrentSessionToken(request.user, request.token);
      response.sendStatus(200);
    } catch (error) {
      next(error)
    }
  }

  createUser = async (request: RequestDTO, response: Response, next: NextFunction) => {
    try {
      const { user, token } = await this.userService.createUser(request.body);
      // TODO - rename this function to createUserAndGenerateToken?
      response.status(201).send({ user, token });
    } catch (error) {
      next(error);
    }
  }

  getUserById = async (request: RequestDTO, response: Response, next: NextFunction) => {
    try {
      response.status(200).send({ user: request.user });
    } catch (error) {
      next(error);
    }
  }

  updateUser = async (request: RequestDTO, response: Response, next: NextFunction) => {
    try {
      const user = await this.userService.updateUser(request.body, request.user);
      response.status(200).send(user);
    } catch(error) {
      next(error);
    }
  }

  deleteUser = async (request: RequestDTO, response: Response, next: NextFunction) => {
    try {
      await User.findByIdAndDelete(request.user._id)
      response.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  getNavigationItems = async (request: RequestDTO, response: Response, next: NextFunction) => {
    const user = request.user;
    console.log("User: ", user);

    try {
      const navigationItems = await this.userService.getNavigationItems(user);
      response.status(200).send(navigationItems);
    } catch(error) {
      next(error);
    }
  }
}

export default UserController;
